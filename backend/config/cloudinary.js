import { v2 as cloudinary } from "cloudinary";

console.log("🔧 Cloudinary Config:", {
  cloud_name: process.env.CLOUD_NAME ? "✅ Set" : "❌ Missing",
  api_key: process.env.CLOUD_API_KEY ? "✅ Set" : "❌ Missing",
  api_secret: process.env.CLOUD_API_SECRET ? "✅ Set" : "❌ Missing",
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error("⚠️  WARNING: Cloudinary credentials are missing in .env file!");
}

export default cloudinary;