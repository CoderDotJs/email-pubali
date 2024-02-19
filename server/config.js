import dotenv from "dotenv";
dotenv.config({});

export default {
  db_url: process.env.DB_URL,
  port: process.env.PORT,
  smtp_email: process.env.SMTP_MAIL,
  smpt_pass: process.env.SMTP_PASS,
};
