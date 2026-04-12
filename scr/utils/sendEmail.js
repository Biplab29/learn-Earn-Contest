import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,          // smtp.gmail.com
    port: parseInt(process.env.EMAIL_PORT), // must be number: 587
    secure: false,                          // false for port 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,        // Gmail App Password (16 chars)
    },
    tls: {
      rejectUnauthorized: false,           // avoids cert issues on some servers
    },
  });

  try {
    // Verify connection first so errors are clear
    await transporter.verify();
  } catch (verifyError) {
    console.error("❌ Email transporter verification failed:", verifyError.message);
    throw new Error(`Email config error: ${verifyError.message}`);
  }

  const info = await transporter.sendMail({
    from: `"Learn & Earn Contest" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("✅ Email sent:", info.messageId, "→", to);
  return info;
};

console.log("✅ sendEmail utility loaded");