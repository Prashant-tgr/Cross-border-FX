import mongoose from 'mongoose';

const railOptionSchema = new mongoose.Schema(
  {
    railId: {
      type: String,
      required: true,
      enum: ['swift', 'local_clearing', 'airwallex', 'wise', 'nium', 'currencycloud', 'ripple_fiat'],
    },
    name: {
      type: String,
      required: true,
    },
    railType: {
      type: String,
      enum: ['SWIFT', 'LOCAL_RAILS', 'FINTECH_PARTNER'],
      required: true,
    },
    exchangeRate: {
      type: Number,
      required: true,
    },
    spreadBps: {
      type: Number, // Basis points markup over mid-market rate
      required: true,
    },
    fixedFee: {
      type: Number, // In source currency
      default: 0,
    },
    percentageFee: {
      type: Number, // e.g. 0.002 = 0.2%
      default: 0,
    },
    estimatedHours: {
      type: Number,
      required: true, // e.g. 0.5 for instant/30min, 24 for 1 day, 72 for SWIFT (3 days)
    },
    reliabilityScore: {
      type: Number, // 0 to 100%
      default: 98,
    },
    supportedCorridors: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const rateFeedSchema = new mongoose.Schema(
  {
    corridor: {
      type: String,
      required: true, // e.g., 'USD-EUR', 'USD-INR', 'GBP-SGD', 'EUR-BRL'
      unique: true,
    },
    sourceCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    targetCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    midMarketRate: {
      type: Number,
      required: true,
    },
    rails: [railOptionSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const RateFeed = mongoose.model('RateFeed', rateFeedSchema);
