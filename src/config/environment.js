import dotenv from 'dotenv'
dotenv.config()
export const environment = {
  PORT: process.env.PORT || 4000,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  SENDGRID_APIKEY: process.env.SENDGRID_APIKEY,
  JWT_EXPIRY_TIME: process.env.JWT_EXPIRY_TIME,
  JWT_REFERESH_TIME: process.env.JWT_REFERESH_TIME,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  REFRESH_KEY: process.env.REFRESH_KEY,
  DB_USERNAME: process.env.POSTGRES_DB_USERNAME,
  DB_PASSWORD: process.env.POSTGRES_DB_PASSWORD,
  DB_NAME: process.env.POSTGRES_DB_DATABASE,
  DB_HOST: process.env.POSTGRES_DB_HOST,
  DB_CONNECTION: process.env.POSTGRES_DB_CONNECTION,

  resetPasswordTokenTime: 3600000, // 1hour
  refreshExpiryTime: process.env.REFRESH_EXPIRY_TIME || "7d",
  verifyAttempts: process.env.VERIFY_ATTEMPT,
};
