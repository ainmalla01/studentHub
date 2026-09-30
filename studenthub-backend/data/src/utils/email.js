import nodemailer from "nodemailer";
import { env, emailConfigured } from "../config/env.js";
import { logger } from "../config/logger.js";
import { escapeHtml } from "./escapeHtml.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = env.SMTP_HOST
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.EMAIL_USER ? { user: env.EMAIL_USER, pass: env.EMAIL_PASS } : undefined,
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
      });

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  if (!emailConfigured) {
    // Only reachable outside production (env validation blocks production start).
    logger.warn({ to, subject }, "Email is not configured - message was NOT sent.");
    logger.debug({ text }, "Email body (development only)");
    return { delivered: false };
  }

  await getTransporter().sendMail({
    from: env.EMAIL_FROM || env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
  return { delivered: true };
};

/**
 * Sends the temporary credentials for a newly created (or reset) student account.
 * Throws if the provider rejects the message; callers decide how to handle that.
 */
export const sendStudentEmail = ({ email, studentId, temporaryPassword }) =>
  sendMail({
    to: email,
    subject: "Your StudentHub account",
    text:
      `Welcome to StudentHub.\n\nStudent ID: ${studentId}\nEmail: ${email}\n` +
      `Temporary password: ${temporaryPassword}\n\n` +
      `Sign in at ${env.CLIENT_URL} and change your password on first login.`,
    html: `
      <h2>Welcome to StudentHub</h2>
      <p>Your student account is ready.</p>
      <p><strong>Student ID:</strong> ${escapeHtml(studentId)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Temporary password:</strong> ${escapeHtml(temporaryPassword)}</p>
      <p>
        Sign in at <a href="${escapeHtml(env.CLIENT_URL)}">${escapeHtml(env.CLIENT_URL)}</a>.
        You will be asked to choose a new password on your first login.
      </p>
    `,
  });
