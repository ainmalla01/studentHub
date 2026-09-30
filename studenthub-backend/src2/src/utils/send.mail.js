import { transporter } from "../config/mail.js";

export async function sendWelcomeEmail(to, name, password) {
  const info = await transporter.sendMail({
    from: `"StudentHub AI" <${process.env.MAIL_USER}>`,
    to,
    subject: "Welcome to StudentHub AI",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">

        <h2 style="color: #1f2937;">
          Welcome to StudentHub AI, ${name}!
        </h2>

        <p>Dear ${name},</p>

        <p>
          We are pleased to inform you that your student account has been
          successfully created on <b>StudentHub AI</b>, the student community
          and project collaboration platform of Vedas College.
        </p>

        <p>
          StudentHub AI provides you with a centralized platform to explore
          challenges, participate in projects, submit your work, develop your
          skills, track your performance, and showcase your academic achievements.
        </p>

        <p>
          We encourage you to make the best use of StudentHub AI by actively
          participating in challenges, improving your technical skills,
          submitting quality work, and keeping your profile and achievements
          up to date.
        </p>

        <h3 style="color: #1f2937;">
          Your Login Credentials
        </h3>

        <div style="
          background-color: #f5f7fa;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin: 15px 0;
        ">
          <p style="margin: 5px 0;">
            <b>Email:</b> ${to}
          </p>

          <p style="margin: 5px 0;">
            <b>Password:</b> ${password}
          </p>
        </div>

        <p>
          Please keep your login credentials secure and do not share your
          password with anyone. If you are required to change your password
          after your first login, please complete the password change before
          continuing to use the platform.
        </p>

        <p>
          We look forward to seeing you actively participate and make the most
          of the opportunities available through StudentHub AI.
        </p>

        <p>
          Best regards,<br>
          <b>StudentHub AI</b><br>
          Vedas College
        </p>

      </div>
    `,
  });

  console.log("Email sent:", info.messageId);

  return info;
}