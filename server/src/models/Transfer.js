import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    sourceCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    sourceAmount: {
      type: Number,
      required: true,
    },
    targetCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    netLandingAmount: {
      type: Number,
      required: true,
    },
    routingDecision: {
      strategy: {
        type: String,
        enum: ['LOWEST_COST', 'FASTEST_DELIVERY', 'MAX_RELIABILITY', 'MANUAL'],
        default: 'LOWEST_COST',
      },
      selectedRailId: {
        type: String,
        required: true,
      },
      selectedRailName: {
        type: String,
        required: true,
      },
      selectedRailType: {
        type: String,
        enum: ['SWIFT', 'LOCAL_RAILS', 'FINTECH_PARTNER'],
        required: true,
      },
    },
    pricingBreakdown: {
      midMarketRate: {
        type: Number,
        required: true,
      },
      effectiveRate: {
        type: Number,
        required: true,
      },
      spreadBps: {
        type: Number,
        required: true,
      },
      fixedFee: {
        type: Number,
        default: 0,
      },
      percentageFeeAmount: {
        type: Number,
        default: 0,
      },
      totalFeeSourceCurrency: {
        type: Number,
        required: true,
      },
      benchmarkBankCost: {
        type: Number,
        required: true, // Typical 250 bps bank markup + $45 SWIFT wire fee
      },
      savedAmountSourceCurrency: {
        type: Number,
        required: true,
      },
      profitSplitTake: {
        type: Number,
        default: 0, // Basis point split platform fee
      },
    },
    deliveryEstimateHours: {
      type: Number,
      default: 24,
    },
    status: {
      type: String,
      enum: ['QUOTE_LOCKED', 'INITIATED', 'IN_CLEARING', 'SETTLED', 'FAILED'],
      default: 'INITIATED',
    },
    settledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Transfer = mongoose.model('Transfer', transferSchema);
