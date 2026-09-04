import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          timeout: 60000, // 60 seconds timeout
        },
        (error, result) => {
          if (error) {
            const errMsg = error?.message || error?.toString() || "Unknown Cloudinary error";
            console.error("🔴 Cloudinary Upload Error:", {
              message: errMsg,
              code: error?.http_code,
              name: error?.name,
            });
            return reject(new Error(`Cloudinary upload failed: ${errMsg}`));
          }
          if (!result) {
            return reject(new Error("Cloudinary returned empty result"));
          }
          resolve(result);
        }
      );

      uploadStream.on("error", (err) => {
        const msg = err?.message || err?.toString() || "Unknown stream error";
        console.error("🔴 Stream Error:", msg);
        reject(new Error(`Upload stream error: ${msg}`));
      });

      uploadStream.end(fileBuffer);
    } catch (err) {
      const msg = err?.message || err?.toString() || "Unknown upload error";
      console.error("🔴 Upload Error:", msg);
      reject(new Error(`Upload error: ${msg}`));
    }
  });
};