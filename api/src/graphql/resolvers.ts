import { sequelize } from "../database";
import { Report } from "../models/Report";
import { Location } from "../models/Location";
import { S3File } from "../models/S3File";
import { ReportFile } from "../models/ReportFile";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import { generatePresignedUrl } from "../s3PresignedUrl";

import { GraphQLScalarType, Kind } from "graphql";
import { DateTimeScalar } from "graphql-date-scalars";
import Neighborhood from "../models/Neighborhood";
import { complaintTypesJson } from "@reported/shared/src/ComplaintType";
import { ReportCreatedForNeighborhoodsSubscription, 
  ReportCreatedForNeighborhoodsSubscriptionVariables,  ReportInput,
  SubscriptionReportCreatedForNeighborhoodsArgs, } from  "@reported/shared/src/generated/graphql";
import { StringMapScalar } from "./StringMapScalar"
import { pub } from "./pub";
import { withFilter } from "graphql-subscriptions";

export const resolvers = {
  StringMap: StringMapScalar,
  DateTime: DateTimeScalar,
  Query: {
    reports: async () => {
      return await Report.findAllWithLocations().then(x => {
        return x
      });
    },
    report: async (_: any, { id }: { id: number }) => {
      return await Report.findByPk(id, {
        include: [
          { model: Location },
          { model: S3File, as: "files", required: false }
        ],
      });
    },
    complaints: async(_:any) => {
      console.log(complaintTypesJson)
      return complaintTypesJson
    },
    neighborhoods: async (_:any) => {
      const neighborhoods = await Neighborhood.findAll()
      return neighborhoods
    },
    neighborhood: async (_: any, { name }: { name: string }) => {
      const neighborhood = await Neighborhood.findOne({
        where: {
          name: {
            [Op.iLike]: `%${name}%` // Case-insensitive search
          }
        },
      });

      return neighborhood;
    },
    reportsForNeighborhoodCount: async (_: any, { filters}: {filters: any}) => {
      const { neighborhood, createdAfter, complaint } = filters;

      const reports =  await Report.count({
        include: [
          {
            model: Location,
          },
          { model: S3File, as: "files", required: false }
        ],
        where: {
          ...(createdAfter && { created: { [Op.gte]: createdAfter } }),
          ...(complaint && { complaint }),
          [Op.and]: sequelize.literal(`
            ST_Contains(
              (SELECT geojson FROM neighborhoods WHERE name ILIKE '${neighborhood}' LIMIT 1),
              location.geometry
            )
          `),
        },
      });
      return reports
    },
    reportsForNeighborhood: async (_: any, { filters }: { filters: any }) => {
      const { neighborhood, createdAfter, complaint } = filters;

      const reports =  await Report.findAllWithLocations(
        {
          ...(createdAfter && { created: { [Op.gte]: createdAfter } }),
          ...(complaint && { complaint }),
          [Op.and]: sequelize.literal(`
            ST_Contains(
              (SELECT geojson FROM neighborhoods WHERE name ILIKE '${neighborhood}' LIMIT 1),
              location.geometry
            )
          `),
      });
      pub.publish("REPORT_CREATED", reports)
      return reports
    }
  },
  Subscription: {
    reportCreated: {
      subscribe: 
        pub.asyncIterableIterator(["REPORT_CREATED"])
      ,
      resolve: (payload:any)=> {
        console.log("🚀 Report Created Event:", payload);
        return payload; // ✅ Should return a single object, NOT an array
      }
    },
    reportCreatedForNeighborhoods: {
      subscribe: withFilter(
        () => pub.asyncIterableIterator(["REPORT_CREATED_FOR_NEIGHBORHOODS"]),
        (
          payload: any,
          variables: any
        ) => {
          console.log("payload", payload)
          console.log("variables",variables)
          return true
        }
      ),
    },
  
  },
  
  Mutation: {
    deleteReport: async (_: any, { id }: { id: number }) => {
      return await sequelize.transaction(async (transaction) => {
        const report = await Report.findByPk(id, {
          transaction
        });
        if(!report) {
          return true
        }
        await ReportFile.destroy({ where: { report_id: id }, transaction });
        await report.destroy({transaction})
        return true
      })      
    },
    createReport: async (
      _: any,
      { reports }: { reports: ReportInput[] }
    ) => {
      return await sequelize.transaction(async (transaction) => {
        const createdReports = [];
      
        for (const reportData of reports) {
          const { complaint, time, location, files } = reportData; // ✅ Extract location from array

          if (!location || !location.coordinates) {
            throw new Error("Invalid report: Missing location or coordinates");
          }

          let existingLocation = await Location.findOne({
            where: {
              geometry: sequelize.where(
                sequelize.literal(
                  `ST_DWithin(geometry, ST_SetSRID(ST_MakePoint(${location.coordinates.lng}, ${location.coordinates.lat}), 4326), 0.0001)`
                ),
                true
              )
            },
            transaction,
          });

          if (!existingLocation) {
            existingLocation = await Location.create(
              {
                geometry: sequelize.literal(
                  `ST_SetSRID(ST_MakePoint(${location.coordinates.lng}, ${location.coordinates.lat}), 4326)`
                ),
                city: location.city,
                state: location.state,
                zip: location.zip,
                street: location.street || null,
                building_number: location.building_number || null,
              },
              { transaction }
            );
          }

          const existingReport = await Report.findOne({
            where: {
              complaint,
              time: new Date(time),
              location_id: existingLocation.id,
            },
            transaction,
          });

          if (existingReport) {
            createdReports.push(existingReport)            
            continue
          }

          const report = await Report.create(
              {
                complaint,
                time: new Date(time),
                location_id: existingLocation.id,
              },
              { transaction }
          );

          for (const file of files) {
            const fileId = uuidv4();
            const url = new URL(file.url)
            url.search = ""
            const s3File = await S3File.create(
              {
                id: fileId,
                file_name: file.file_name,
                s3_url: url.toString(),
                s3_key: file.key,
                bucket_name: file.bucket_name,
                mime_type: file.mime_type,
                width: file.width || null,
                height: file.height || null,
                duration: file.duration || null,
                parent: file.parent || null,
                file_size: file.file_size
              },
              { transaction }
            );

            await ReportFile.create(
              {
                report_id: report.id,
                file_id: s3File.id,
                type: file.mime_type.startsWith("image")
                  ? "image"
                  : file.mime_type.startsWith("video")
                    ? "video"
                    : file.mime_type.startsWith("audio")
                      ? "audio"
                      : file.mime_type.includes("pdf") || file.mime_type.includes("document")
                        ? "document"
                        : "other",
              },
              { transaction }
            );
          }

          createdReports.push(report);
        }

          
        return createdReports
      }).then(async (reports)=> {
        const reported = await Report.findAllWithLocations({
          id: {
            [Op.in]: reports.map(x => x.id)
          }
        });      
        setImmediate(async () => {
          const reportsByNeighborhood = reported.reduce((acc, report) => {
            const neighborhoods = (report.get("location") as Location)?.neighborhoods || [];
          
            neighborhoods.forEach((neighborhood) => {
              if (!acc[neighborhood]) {
                acc[neighborhood] = []; // ✅ Initialize as an array
              }
              acc[neighborhood].push(report); // ✅ Push the report into the array
            });
          
            return acc;
          }, {} as Record<string, Report[]>); // ✅ Corrected type

          for (const [neighborhood, reports] of Object.entries(reportsByNeighborhood)) {
            console.log(`Publishing ${reports.length} reports for ${neighborhood}`);
            const payload: { reportCreatedForNeighborhoods: Report[] } = {
              reportCreatedForNeighborhoods: reports,
            };
            await pub.publish("REPORT_CREATED_FOR_NEIGHBORHOODS", payload);
          }
        })
        return reported
      });
    },
    presignedUrls: async (_parent: any, { keys }: {
      keys: {
        key: string,
        contentType: string
      }[]
    }) => {
      // Generate pre-signed URLs for each provided key
      const method = "PUT"
      const urls = await Promise.all(
        keys.map(async ({ key, contentType }) => {
          const pre = await generatePresignedUrl({ key, contentType, operation: method })
          return {
            url: pre.url,
            method: method,
            key: pre.key,
            contentType: contentType,
            bucketName: pre.bucket
          };
        })
      );

      return urls;
    },
  },
};