import { Resend } from 'resend';
import { AppError } from '../middleware/error.js';

const getResendConfig = () => {
  const { RESEND_API_KEY, RESEND_FROM } = process.env;

  if (!RESEND_API_KEY?.trim() || !RESEND_FROM?.trim()) {
    throw new AppError('Email OTP delivery is not configured.', 503);
  }

  return { apiKey: RESEND_API_KEY.trim(), from: RESEND_FROM.trim() };
};

export const assertEmailDeliveryConfigured = () => {
  getResendConfig();
};

export const sendPasswordResetEmail = async (email, otp) => {
  const config = getResendConfig();
  const resend = new Resend(config.apiKey);

  const { error } = await resend.emails.send({
    from: config.from,
    to: email,
    subject: 'Your Cross-Border FX password reset code',
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
  });

  if (error) {
    throw new Error(`Resend API email delivery failed: ${error.message}`);
  }
};
