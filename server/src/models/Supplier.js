import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: true, // e.g., 'DE', 'IN', 'GB', 'SG', 'BR'
    },
    settlementCurrency: {
      type: String,
      required: true, // e.g., 'EUR', 'INR', 'GBP', 'SGD', 'BRL'
      uppercase: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountNumberOrIban: {
      type: String,
      required: true,
      trim: true,
    },
    swiftBicOrRouting: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Manufacturing', 'Raw Materials', 'IT & Software', 'Logistics & Freight', 'Professional Services'],
      default: 'Manufacturing',
    },
    preferredRoutingStrategy: {
      type: String,
      enum: ['LOWEST_COST', 'FASTEST_DELIVERY', 'MAX_RELIABILITY'],
      default: 'LOWEST_COST',
    },
    totalDisbursedAmount: {
      type: Number,
      default: 0,
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

export const Supplier = mongoose.model('Supplier', supplierSchema);
