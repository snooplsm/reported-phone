import { sequelize } from "../database.js";
import { Report,Location, S3File, ReportFile } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import { generatePresignedUrl } from "../s3PresignedUrl.js";

import Neighborhood from "../models/Neighborhood.js";
import { complaintTypesJson } from "@reported/shared/complaint";
import {
   ReportFilterInput,  ReportInput,
  } from  "@reported/shared/server";
  

const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let pub: any = null; // ✅ Only initialize in local mode

import { PubSub, withFilter } from "graphql-subscriptions"

let Subscription:object = {}
if (!isAWS) {  
    pub = new PubSub();
    Subscription = {
        reportCreated: {
          subscribe: () => pub!.asyncIterator(["REPORT_CREATED"]),
          resolve: (payload: any) => {
            console.log("🚀 Report Created Event:", payload);
            return payload; // ✅ Should return a single object, NOT an array
          },
        },
        reportCreatedForNeighborhoods: {
          subscribe: withFilter(
            () => pub!.asyncIterator(["REPORT_CREATED_FOR_NEIGHBORHOODS"]),
            (payload: any, variables: any) => {
              console.log("payload", payload);
              console.log("variables", variables);
              return true; // ✅ Apply custom filtering logic here
            }
          ),
        },
    }
  } else {
  Subscription = {}
}
  
export const resolvers = {
  Subscription,
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
    neighborhood: async (_: any, { names }: { names: string[] }) => {
      if (!Array.isArray(names) || names.length === 0) {
        throw new Error("Invalid or empty names array");
      }
    
      const neighborhoods = await Neighborhood.findAll({
        where: {
          [Op.or]: names.map(n => ({
            name: { [Op.iLike]: `%${n}%` } // Case-insensitive search for each name
          }))
        }
      });
    
      return neighborhoods;
    },
    reportsForNeighborhoodCount: async (_: any, { filters}: {filters: ReportFilterInput}) => {
      const { neighborhoods, createdAfter, createdBefore, complaints } = filters;

      const reports =  await Report.count({
        include: [
          {
            model: Location,
          },
          { model: S3File, as: "files", required: false }
        ],
        where: {
          ...(createdAfter && { created: { [Op.gte]: createdAfter } }),
          ...(createdBefore && { created: { [Op.lte]: createdBefore } }),
          ...(complaints && { complaint: { [Op.in]: complaints } }), // Make complaints a list of OR conditions
          ...(neighborhoods && { [Op.and]: sequelize.literal(`
            EXISTS (
              SELECT 1 FROM neighborhoods 
              WHERE neighborhoods.name ILIKE ANY (ARRAY[${neighborhoods
                .map((n) => sequelize.escape(`%${n}%`))
                .join(",")}])
              AND ST_Contains(neighborhoods.geojson, location.geometry)
            )
          `)})
          ,
        }
      });
      return reports
    },
    reportsForNeighborhood: async (_: any, { filters }: { filters: ReportFilterInput }) => {
      console.log(filters)
      const { neighborhoods, createdAfter, complaints, createdBefore } = filters;

      const reports =  await Report.findAllWithLocations(
        {
          ...(createdAfter && { created: { [Op.gte]: createdAfter } }),
          ...(createdBefore && { created: { [Op.lte]: createdBefore } }),
          ...(complaints && { complaint: { [Op.in]: complaints } }), // Make complaints a list of OR conditions
          ...(neighborhoods && {[Op.and]: sequelize.literal(`
            EXISTS (
              SELECT 1 FROM neighborhoods 
              WHERE neighborhoods.name ILIKE ANY (ARRAY[${neighborhoods
                .map((n) => sequelize.escape(`%${n}%`))
                .join(",")}])
              AND ST_Contains(neighborhoods.geojson, location.geometry)
            )
          `)})
      });
      reports.forEach(report => {
        if (!report.id) {
          console.error("ERROR: Report missing ID!", report);
        }
      });
      pub.publish("REPORT_CREATED", reports)
      return reports
    }
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