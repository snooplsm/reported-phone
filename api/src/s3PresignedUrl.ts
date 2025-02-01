import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

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

// ✅ Function to Generate Pre-Signed URL
export const generatePresignedUrl = async ({
  key,
  contentType,
  bucket = process.env.AWS_S3_BUCKET || "default-bucket",
  operation = "PUT",
  expiresIn = 3000
}: PresignedUrlRequest) => {
  const command = operation === "PUT"
    ? new PutObjectCommand({ Bucket: bucket, Key: key, ACL: "public-read", ContentType: contentType })
    : new GetObjectCommand({ Bucket: bucket, Key: key});
  return await getSignedUrl(s3Client, command, { expiresIn });
};
