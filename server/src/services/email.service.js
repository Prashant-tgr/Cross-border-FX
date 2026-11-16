import nodemailer from 'nodemailer';
import { AppError } from '../middleware/error.js';

const getSmtpConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const port = Number(SMTP_PORT);

  if (!SMTP_HOST || !Number.isInteger(port) || port <= 0 || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new AppError('Email OTP delivery is not configured.', 503);
  }

  return { host: SMTP_HOST, port, user: SMTP_USER, password: SMTP_PASS, from: SMTP_FROM };
};

export const assertEmailDeliveryConfigured = () => {
  getSmtpConfig();
};

export const sendPasswordResetEmail = async (email, otp) => {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: 'Your Cross-Border FX password reset code',
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
  });
};
