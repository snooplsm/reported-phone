const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        const bucket = "reportedphilly";
        const key = decodeURIComponent(event.queryStringParameters.key); // Example: "uploads/original/image.jpg"
        
        // Parse width, height, and crop mode from key
        const keyParts = key.split("/");
        const sizePart = keyParts[2]; // Example: "800x600-centerCrop"
        const originalKey = keyParts.slice(3).join("/"); // "uploads/original/image.jpg"

        const [width, height, cropMode] = sizePart.split(/x|-crop/);
        const targetWidth = parseInt(width);
        const targetHeight = parseInt(height);
        const centerCrop = cropMode === "centerCrop";

        // Define new cached filename path
        const cachedKey = `uploads/resized/${sizePart}/${originalKey}`;

        console.log(`Checking cache for: ${cachedKey}`);

        // ✅ **Step 1: Check if resized image exists in S3**
        try {
            await s3.headObject({ Bucket: bucket, Key: cachedKey }).promise();
            console.log("✅ Cached image found, returning existing file.");

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Image already cached",
                    url: `https://${bucket}.s3.amazonaws.com/${cachedKey}`
                })
            };
        } catch (error) {
            console.log("❌ No cached image found, processing now...");
        }

        // ✅ **Step 2: Fetch Original Image from S3**
        const originalImage = await s3.getObject({ Bucket: bucket, Key: originalKey }).promise();
        let image = sharp(originalImage.Body);
        const metadata = await image.metadata();

        // ✅ **Step 3: Resize or Crop if Needed**
        if (metadata.width > targetWidth || metadata.height > targetHeight) {
            image = centerCrop
                ? image.resize(targetWidth, targetHeight, { fit: "cover", position: "center" })
                : image.resize({ width: targetWidth, height: targetHeight, fit: "inside" });
        } else {
            console.log("Image is already smaller than requested size. Skipping resize.");
        }

        const processedImageBuffer = await image.toBuffer();

        // ✅ **Step 4: Upload Resized Image to Cache Location**
        await s3.putObject({
            Bucket: bucket,
            Key: cachedKey,
            Body: processedImageBuffer,
            ContentType: metadata.format
        }).promise();

        console.log("✅ Image resized & cached:", cachedKey);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Image resized successfully",
                url: `https://${bucket}.s3.amazonaws.com/${cachedKey}`
            })
        };

    } catch (error) {
        console.error("❌ Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};