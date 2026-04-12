import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? `[${process.env.EMAIL_PASS.length} chars]` : "MISSING");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify()
  .then(() => {
    console.log("\n✅ Gmail SMTP connection SUCCESSFUL — credentials are valid!");
  })
  .catch((e) => {
    console.error("\n❌ Gmail SMTP FAILED:", e.message);
    console.error("\nFull error:", e);
  });
