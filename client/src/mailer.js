import { Mailer } from "nodemailer-react";
import EmailTemplate from "./EmailTemplate";
const mailerConfig = {
  host: "smtp.gmail.com.",
  port: 587,
  auth: {
    user: "md.akash6724@gmail.com",
    pass: "fyvg siyb isri hdwv",
  },
};
/** Record of all emails that will be available */
const emailsList = {
  EmailTemplate,
};

/** Instance of mailer to export */
const mailer = Mailer(mailerConfig, emailsList);

export default mailer;
