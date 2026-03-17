import cloudinary from "../config/cloudinary.js";
import ApiError from "./ApiError.js";

export const uploadToCloudinary = async (
  fileBuffer,
  fileName,
  resourceType = "auto",
) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: `street_guard_ai/${Date.now()}_${fileName}`,
          folder: "street_guard_ai",
          quality: "auto",
          eager: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            reject(new ApiError(400, "Failed to upload file to Cloudinary"));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    throw new ApiError(400, "File upload failed: " + error.message);
  }
};
