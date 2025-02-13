const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        const bucket = "reportedphilly";
        const key = decodeURIComponent(event.queryStringParameters.key);
        console.log("key is ", key);

        // Parse width, height, and crop mode
        const wParam = event.queryStringParameters.w;
        const hParam = event.queryStringParameters.h;
        const cropParam = event.queryStringParameters.crop || "none";

        // Convert to integers (NaN if missing)
        let targetWidth = parseInt(wParam, 10);
        let targetHeight = parseInt(hParam, 10);
        const centerCrop = cropParam === "center";

        // Fetch original image metadata
        const originalImage = await s3.getObject({ Bucket: bucket, Key: key }).promise();
        let image = sharp(originalImage.Body);
        const metadata = await image.metadata();

        // Compute missing dimension using aspect ratio
        const aspectRatio = metadata.width / metadata.height;

        if (isNaN(targetWidth) && isNaN(targetHeight)) {
            console.error("❌ Both width and height are missing.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "At least one of w (width) or h (height) must be provided" })
            };
        }

        if (isNaN(targetWidth)) {
            targetWidth = Math.round(targetHeight * aspectRatio);
        }
        if (isNaN(targetHeight)) {
            targetHeight = Math.round(targetWidth / aspectRatio);
        }

        console.log(`🔹 Resizing to: ${targetWidth}x${targetHeight}, Original: ${metadata.width}x${metadata.height}`);

        // Skip resizing if image is already smaller
        if (metadata.width <= targetWidth && metadata.height <= targetHeight) {
            console.log("✅ Image is already smaller than requested size. Skipping resize.");
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Image already smaller than requested size",
                    originalSize: `${metadata.width}x${metadata.height}`
                })
            };
        }

        // Perform resizing
        image = centerCrop
            ? image.resize(targetWidth, targetHeight, { fit: "cover", position: "center" })
            : image.resize({ width: targetWidth, height: targetHeight, fit: "inside" });

        const processedImageBuffer = await image.toBuffer();

        // Upload resized image
        await s3.putObject({
            Bucket: bucket,
            Key: `resized/${targetWidth}x${targetHeight}/${key}`,
            Body: processedImageBuffer,
            ContentType: metadata.format
        }).promise();

        console.log("✅ Image resized & cached:", key);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Image resized successfully",
                url: `https://${bucket}.s3.amazonaws.com/resized/${targetWidth}x${targetHeight}/${key}`
            })
        };

    } catch (error) {
        console.error("❌ Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};