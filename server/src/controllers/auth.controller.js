import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_cross_border_fx_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

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

    const token = signToken(user._id);

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

    const token = signToken(user._id);

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
