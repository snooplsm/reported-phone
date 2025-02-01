import { sequelize } from "../database";
import { Report } from "../models/Report";
import { Location } from "../models/Location";
import { S3File } from "../models/S3File";
import { ReportFile } from "../models/ReportFile";
import { v4 as uuidv4 } from "uuid";
import { GraphQLError } from "graphql";
import { Sequelize } from "sequelize";
import { generatePresignedUrl } from "../s3PresignedUrl";

import { GraphQLScalarType, Kind } from "graphql";
import { StringMap } from "aws-sdk/clients/ecs";

const StringMapScalar = new GraphQLScalarType({
  name: "StringMap",
  description: "A key-value object where both keys and values are strings",
  parseValue(value) {
    return typeof value === "object" ? value : null;
  },
  serialize(value) {
    return typeof value === "object" ? value : null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      const parsedObject = Object.create(null);
      ast.fields.forEach(field => {
        if (field.value.kind === Kind.STRING) {
          parsedObject[field.name.value] = field.value.value; // ✅ Fix: Extract only values
        }
      });
      return parsedObject;
    }
    return null;
  },
});

export const resolvers = {
  StringMap: StringMapScalar,
  Query: {
    reports: async () => {
      return await Report.findAll({
        include: [
          { model: Location },
          { model: S3File, as: "files", required: false }
        ],        
        logging: console.log
      }).then(x=> {
        
        return x
      });
    },
    report: async (_: any, { id }: { id: number }) => {
      return await Report.findByPk(id, {
        include: [
          { model: Location },
          { model: ReportFile, include: [S3File] },
        ],
      });
    }    
  },

  Mutation: {
    createReport: async (
      _: any,
      {
        complaint,
        time,
        location,
        files,
      }: {
        complaint: string;
        location: {
          coordinates: { lat: number; lng: number };
          city: string;
          state: string;
          zip: string;
          street?: string;
          building_number?: string;
        };
        time: string;
        files: {
          file_name: string;
          s3_url: string;
          s3_key: string;
          bucket_name: string;
          mime_type: string;
          width?: number;
          height?: number;
          duration?: number;
          parent?: string;
          file_size: number;
        }[];
      }
    ) => {
        console.log("create report")
      return await sequelize.transaction(async (transaction) => {
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

        console.log("existing", existingLocation)

        if (!existingLocation) {
          existingLocation = await Location.create(
            {
              geometry: sequelize.literal(
                `ST_SetSRID(ST_MakePoint(${location.coordinates.lat}, ${location.coordinates.lng}), 4326)`
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
        console.log(complaint, new Date(time), existingLocation.id, )
        let report:Report;

        try {
          report = await Report.create(
            {
              complaint,
              time: new Date(time),
              location_id: existingLocation.id,
            },
            { transaction }
          );
        } catch (error) {          
          throw new GraphQLError('Invalid argument value', {
            extensions: {
              code: 'CONFLICT',
            },
          });
        }
        console.log("reporte created")
        console.log(files)
        for (const file of files) {
          const fileId = uuidv4();

          const s3File = await S3File.create(
            {
              id: fileId,
              file_name: file.file_name,
              s3_url: file.s3_url,
              s3_key: file.s3_key,
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

        console.log("files created", report.id)

        return await Report.findByPk(report.id, {
            include: [
                { model: Location },
                {
                  model: ReportFile,
                  required: false, // Acts like an INNER JOIN, ensuring only matching S3Files are retrieved
                  include: [
                    {
                      model: S3File,
                      required: false, // Ensures only ReportFiles with valid S3Files are returned
                    },
                  ],
                },
              ],
          transaction,
        });
      });
    },
    presignedUrls: async (_parent:any, { keys }: { keys: { 
      key: string,
      contentType: string
     }[] 
    }) => {
      // Generate pre-signed URLs for each provided key
      const method = "PUT"
      const urls = await Promise.all(
        keys.map(async ({ key, contentType }) => {                   
          return {
            url: await generatePresignedUrl({key, contentType, operation:method}),
            method: method,
          };
        })
      );

      return urls;
    },
  },
};