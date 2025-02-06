import nodemailer from 'nodemailer';
import { createLogger } from './logger.js';

const logger = createLogger('email-service');

// Create reusable transporter
const createTransporter = () => {
  // For production
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // For development
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const templates = {
  verificationEmail: (data) => ({
    subject: 'Please verify your email',
    html: `
      <h1>Welcome ${data.firstName}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${data.verificationURL}">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  }),
  resetPassword: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Hi ${data.firstName},</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${data.resetURL}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  })
};

export const sendEmail = async ({ email, template, data }) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = templates[template](data);

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${email}`);
  } catch (error) {
    logger.error(`Error sending email to ${email}: ${error.message}`);
    throw error;
  }
};
