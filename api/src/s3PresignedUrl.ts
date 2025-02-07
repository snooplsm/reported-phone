import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import moment from "moment";

// ✅ AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // e.g., "us-east-1"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface PresignedUrlRequest {
  key: string;
  contentType?: string;
  bucket?: string;
  operation?: "PUT" | "GET";
  expiresIn?: number;
}

const renameFile = (originalFilename: string) => {
  const today = moment()
  const fileExtension = originalFilename.split(".").pop();
  // const today = new Date();
  const year = today.format("YYYY")
  const dayOfYear = today.format("DDD")
  const timestamp = today.format("YYYYMMDDdddHHmmssSSS")

  return `uploads/${year}/${dayOfYear}/${originalFilename.replace(/\s+/g, "-").toLowerCase()}`;
};

export const generatePresignedUrl = async ({
  key,
  contentType,
  bucket = process.env.AWS_S3_BUCKET || "default-bucket",
  operation = "PUT",
  expiresIn = 3000
}: PresignedUrlRequest) => {
  const fileName = renameFile(key)
  const command = operation === "PUT"
    ? new PutObjectCommand({ Bucket: bucket, Key: fileName, ContentType: contentType, StorageClass: "GLACIER_IR" })
    : new GetObjectCommand({ Bucket: bucket, Key: fileName});
  return await {bucket, key: fileName, url:await getSignedUrl(s3Client, command, { expiresIn })};
};

