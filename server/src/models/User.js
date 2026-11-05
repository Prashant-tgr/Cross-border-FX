import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    companyName: {
      type: String,
      default: 'Global Enterprises Inc.',
    },
    role: {
      type: String,
      enum: ['admin', 'treasury_manager', 'operator', 'auditor'],
      default: 'treasury_manager',
    },
    pricingPlan: {
      type: String,
      enum: ['fixed_retainer', 'basis_point_split'],
      default: 'basis_point_split', // $2,000/mo or basis point profit split
    },
    basisPointSplitRate: {
      type: Number,
      default: 20, // 20 bps of savings achieved
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model('User', userSchema);
