import nodemailer from "nodemailer";
import dotenv from 'dotenv';


dotenv.config();



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export async function sendWelcomeEmail(to, name) {
  const info = await transporter.sendMail({
    from: `"StudentHub AI" <${process.env.MAIL_USER}>`,
    to,
    subject: "Welcome to StudentHub AI",
    html: `
      <h2>Welcome to StudentHub AI, ${name}!</h2>

      <p>Your student account has been created successfully.</p>

      <p>You can now log in to StudentHub AI.</p>

      <p>
        <b>StudentHub AI</b><br>
        Vedas College
      </p>
    `,
  });

  console.log("Email sent:", info.messageId);

  return info;
}
