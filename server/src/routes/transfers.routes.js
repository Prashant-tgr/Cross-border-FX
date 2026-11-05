import { Router } from 'express';
import { z } from 'zod';
import {
  executeTransfer,
  getTransfers,
  getTransferById,
  getAnalyticsSummary,
} from '../controllers/transfers.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

const executeTransferSchema = z.object({
  body: z.object({
    supplierId: z.string().min(1, 'Supplier ID is required'),
    invoiceNumber: z.string().optional(),
    sourceCurrency: z.string().min(3).max(3),
    sourceAmount: z.number().positive(),
    targetCurrency: z.string().min(3).max(3),
    netLandingAmount: z.number().positive(),
    routingDecision: z.object({
      strategy: z.enum(['LOWEST_COST', 'FASTEST_DELIVERY', 'MAX_RELIABILITY', 'MANUAL']),
      selectedRailId: z.string(),
      selectedRailName: z.string(),
      selectedRailType: z.enum(['SWIFT', 'LOCAL_RAILS', 'FINTECH_PARTNER']),
    }),
    pricingBreakdown: z.object({
      midMarketRate: z.number(),
      effectiveRate: z.number(),
      spreadBps: z.number(),
      fixedFee: z.number().optional(),
      percentageFeeAmount: z.number().optional(),
      totalFeeSourceCurrency: z.number(),
      benchmarkBankCost: z.number(),
      savedAmountSourceCurrency: z.number(),
      profitSplitTake: z.number().optional(),
    }),
    deliveryEstimateHours: z.number().optional(),
  }),
});

router.get('/analytics', getAnalyticsSummary);
router.route('/').get(getTransfers).post(validate(executeTransferSchema), executeTransfer);
router.route('/:id').get(getTransferById);

export default router;
