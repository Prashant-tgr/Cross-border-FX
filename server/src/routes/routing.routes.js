import { Router } from 'express';
import { z } from 'zod';
import { getRoutingQuote } from '../controllers/routing.controller.js';
import { optionalProtect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const quoteSchema = z.object({
  body: z.object({
    sourceCurrency: z.string().min(3).max(3),
    targetCurrency: z.string().min(3).max(3),
    amount: z.number().positive('Transfer amount must be positive'),
    strategy: z.enum(['LOWEST_COST', 'FASTEST_DELIVERY', 'MAX_RELIABILITY', 'BALANCED']).optional(),
  }),
});

router.post('/optimize', optionalProtect, validate(quoteSchema), getRoutingQuote);

export default router;
