import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import {
  register,
  login,
  getMe,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    companyName: z.string().optional(),
    role: z.enum(['admin', 'treasury_manager', 'operator', 'auditor']).optional(),
    pricingPlan: z.enum(['fixed_retainer', 'basis_point_split']).optional(),
    basisPointSplitRate: z.number().min(1).max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const passwordResetRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const passwordResetSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().regex(/^\d{6}$/, 'Verification code must be 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many code requests. Please try again later.' },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many verification attempts. Please try again later.' },
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPasswordLimiter, validate(passwordResetRequestSchema), requestPasswordReset);
router.post('/reset-password', resetPasswordLimiter, validate(passwordResetSchema), resetPassword);
router.get('/me', protect, getMe);

export default router;
