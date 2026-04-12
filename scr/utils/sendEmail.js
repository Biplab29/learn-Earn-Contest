// import nodemailer from "nodemailer";

// export const sendEmail = async (to, subject, html) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,          // smtp.gmail.com
//     port: parseInt(process.env.EMAIL_PORT), // must be number: 587
//     secure: false,                          // false for port 587 (STARTTLS)
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,        // Gmail App Password (16 chars)
//     },
//     tls: {
//       rejectUnauthorized: false,           // avoids cert issues on some servers
//     },
//   });

//   try {
//     // Verify connection first so errors are clear
//     await transporter.verify();
//   } catch (verifyError) {
//     console.error("❌ Email transporter verification failed:", verifyError.message);
//     throw new Error(`Email config error: ${verifyError.message}`);
//   }

//   const info = await transporter.sendMail({
//     from: `"Learn & Earn Contest" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });

//   console.log("✅ Email sent:", info.messageId, "→", to);
//   return info;
// };

// console.log("✅ sendEmail utility loaded");



import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Missing email environment variables");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  try {
    await transporter.verify();
    console.log("✅ Email transporter verified");
  } catch (verifyError) {
    console.error("❌ Email transporter verification failed:", verifyError);
    throw new Error(`Email config error: ${verifyError.message}`);
  }

  try {
    const info = await transporter.sendMail({
      from: `"Learn & Earn Contest" <${user}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId, "→", to);
    return info;
  } catch (sendError) {
    console.error("❌ Email send failed:", sendError);
    throw new Error(`Email send error: ${sendError.message}`);
  }
};