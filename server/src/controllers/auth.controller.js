import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { assertEmailDeliveryConfigured, sendPasswordResetEmail } from '../services/email.service.js';

const PASSWORD_RESET_TTL_MS = 10 * 60 * 1000;
const MAX_PASSWORD_RESET_ATTEMPTS = 5;
const PASSWORD_RESET_MESSAGE = 'If an account exists for that email, a verification code has been sent.';
const INVALID_RESET_CODE_MESSAGE = 'Invalid or expired verification code.';

const getPasswordResetSecret = () => {
  if (!process.env.PASSWORD_RESET_SECRET) {
    throw new AppError('Password reset is not configured.', 503);
  }
  return process.env.PASSWORD_RESET_SECRET;
};

const hashPasswordResetOtp = (email, otp) =>
  createHmac('sha256', getPasswordResetSecret()).update(`${email}:${otp}`).digest('hex');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, ver: user.authVersion ?? 0 },
    process.env.JWT_SECRET || 'super_secret_cross_border_fx_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

export const register = async (req, res, next) => {
  try {
    const { name, email, password, companyName, role, pricingPlan, basisPointSplitRate } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      companyName: companyName || 'Global Treasury Corp',
      role: role || 'treasury_manager',
      pricingPlan: pricingPlan || 'basis_point_split',
      basisPointSplitRate: basisPointSplitRate || 20,
    });

    const token = signToken(user);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          role: user.role,
          pricingPlan: user.pricingPlan,
          basisPointSplitRate: user.basisPointSplitRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          role: user.role,
          pricingPlan: user.pricingPlan,
          basisPointSplitRate: user.basisPointSplitRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    getPasswordResetSecret();
    assertEmailDeliveryConfigured();

    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ status: 'success', message: PASSWORD_RESET_MESSAGE });
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = hashPasswordResetOtp(email, otp);
    user.passwordResetOtpHash = otpHash;
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    user.passwordResetAttempts = 0;
    await user.save();

    try {
      await sendPasswordResetEmail(email, otp);
    } catch (error) {
      try {
        await User.updateOne(
          { _id: user._id, passwordResetOtpHash: otpHash },
          { $unset: { passwordResetOtpHash: 1, passwordResetExpiresAt: 1 }, $set: { passwordResetAttempts: 0 } }
        );
      } catch (cleanupError) {
        console.error('Failed to clear an undelivered password reset code:', cleanupError);
      }
      console.error('Password reset email delivery failed:', error);
      return next(new AppError('Unable to send a password reset email right now.', 503));
    }

    return res.status(200).json({ status: 'success', message: PASSWORD_RESET_MESSAGE });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { otp, password } = req.body;
    const user = await User.findOne({ email }).select(
      '+passwordResetOtpHash +passwordResetExpiresAt +passwordResetAttempts'
    );

    if (
      !user ||
      !user.passwordResetOtpHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt <= new Date() ||
      user.passwordResetAttempts >= MAX_PASSWORD_RESET_ATTEMPTS
    ) {
      return next(new AppError(INVALID_RESET_CODE_MESSAGE, 400));
    }

    const storedDigest = Buffer.from(user.passwordResetOtpHash, 'hex');
    const submittedDigest = Buffer.from(hashPasswordResetOtp(email, otp), 'hex');
    if (
      storedDigest.length !== submittedDigest.length ||
      !timingSafeEqual(storedDigest, submittedDigest)
    ) {
      await User.updateOne(
        {
          _id: user._id,
          passwordResetOtpHash: user.passwordResetOtpHash,
          passwordResetExpiresAt: { $gt: new Date() },
          passwordResetAttempts: { $lt: MAX_PASSWORD_RESET_ATTEMPTS },
        },
        { $inc: { passwordResetAttempts: 1 } }
      );
      return next(new AppError(INVALID_RESET_CODE_MESSAGE, 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.updateOne(
      {
        _id: user._id,
        passwordResetOtpHash: user.passwordResetOtpHash,
        passwordResetExpiresAt: { $gt: new Date() },
        passwordResetAttempts: { $lt: MAX_PASSWORD_RESET_ATTEMPTS },
      },
      {
        $set: { password: hashedPassword, passwordResetAttempts: 0 },
        $inc: { authVersion: 1 },
        $unset: { passwordResetOtpHash: 1, passwordResetExpiresAt: 1 },
      }
    );

    if (result.matchedCount !== 1) {
      return next(new AppError(INVALID_RESET_CODE_MESSAGE, 400));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. Please sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};
