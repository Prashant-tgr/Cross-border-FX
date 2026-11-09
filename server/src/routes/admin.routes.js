import { Router } from 'express';
import { z } from 'zod';
import {
  getAdminOverview,
  getAllUsers,
  updateUserPlan,
  getAllCorridorsAdmin,
  updateRailConfig,
  createCorridorAdmin,
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Guard all admin routes with authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

const updateRailSchema = z.object({
  body: z.object({
    corridor: z.string(),
    railId: z.string(),
    spreadBps: z.number().min(0).optional(),
    fixedFee: z.number().min(0).optional(),
    percentageFee: z.number().min(0).optional(),
    estimatedHours: z.number().min(0.1).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'treasury_manager', 'operator', 'auditor']).optional(),
    pricingPlan: z.enum(['fixed_retainer', 'basis_point_split']).optional(),
    basisPointSplitRate: z.number().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

const createCorridorSchema = z.object({
  body: z.object({
    sourceCurrency: z.string().min(3).max(3),
    targetCurrency: z.string().min(3).max(3),
    midMarketRate: z.number().positive(),
  }),
});

router.get('/overview', getAdminOverview);
router.get('/users', getAllUsers);
router.put('/users/:id', validate(updateUserSchema), updateUserPlan);
router.get('/corridors', getAllCorridorsAdmin);
router.put('/corridors/rail', validate(updateRailSchema), updateRailConfig);
router.post('/corridors', validate(createCorridorSchema), createCorridorAdmin);

export default router;
