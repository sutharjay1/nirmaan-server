import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = createTransport({
  host: "smtp.useplunk.com",
  secure: false,
  port: 587,
  auth: {
    user: "plunk",
    pass: "sk_9b5bc30fbec37b4fa7e2e15010ede646c00aeed8d2013ddb",
  },
});

export const sendEmail = async ({ body, subject, to }) => {
  try {
    const mailOptions = {
      from: "hello@sutharjay.com",
      to,
      subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions).then((res) => res);
    console.log("Email sent:", info);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
