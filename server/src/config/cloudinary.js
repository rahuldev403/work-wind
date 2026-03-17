import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

cloudinary.config({
  cloud_name: ENV.cloudinary_name,
  api_key: ENV.cloudinary_key,
  api_secret: ENV.cloudinary_secret,
});

export default cloudinary;
