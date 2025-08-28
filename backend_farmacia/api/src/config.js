import dotenv from "dotenv";
dotenv.config();
export const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/farmacia",
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  nodeEnv: process.env.NODE_ENV || "development"
};
