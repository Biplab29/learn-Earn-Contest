import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const emailHost = process.env.EMAIL_HOST?.trim();
  const emailPort = Number(process.env.EMAIL_PORT || 587);
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

  if (!emailHost || !emailPort || !emailUser || !emailPass) {
    throw new Error("Email configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
  } catch (verifyError) {
    console.error("❌ Email transporter verification failed:", verifyError.message);
    throw new Error(`Email config error: ${verifyError.message}`);
  }

  const info = await transporter.sendMail({
    from: `"Learn & Earn Contest" <${emailUser}>`,
    to,
    subject,
    html,
  });

  console.log("✅ Email sent:", info.messageId, "→", to);
  return info;
};

console.log("✅ sendEmail utility loaded");
