import "dotenv/config";

export const ENV = {
  port: process.env.PORT,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  node_env: process.env.NODE_ENV,
  client_url: process.env.CLIENT_URL,
  db_url: process.env.MONGO_URL,
  email_user: process.env.EMAIL_USER,
  email_password: process.env.EMAIL_PASSWORD,
};
