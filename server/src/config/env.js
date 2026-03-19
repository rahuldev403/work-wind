import "dotenv/config";

export const ENV = {
  port: process.env.PORT,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  node_env: process.env.NODE_ENV,
  client_url: process.env.CLIENT_URL,
  db_url: process.env.MONGO_URL,
  resend_api_key: process.env.RESEND_API_KEY,
  resend_from_email: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_USER,
  mistral_key: process.env.MISTRAL_API_KEY,
  mistral_model: process.env.MISTRAL_MODEL || "mistral-large-latest",
  cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_secret: process.env.CLOUDINARY_API_SECRET,
};
