import { Router } from 'express';
import { z } from 'zod';
import {
  getSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../controllers/suppliers.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

const supplierSchema = z.object({
  body: z.object({
    supplierName: z.string().min(2, 'Supplier name is required'),
    contactEmail: z.string().email().optional(),
    country: z.string().min(2).max(3),
    settlementCurrency: z.string().min(3).max(3),
    bankName: z.string().min(2),
    accountNumberOrIban: z.string().min(4),
    swiftBicOrRouting: z.string().min(4),
    category: z
      .enum(['Manufacturing', 'Raw Materials', 'IT & Software', 'Logistics & Freight', 'Professional Services'])
      .optional(),
    preferredRoutingStrategy: z.enum(['LOWEST_COST', 'FASTEST_DELIVERY', 'MAX_RELIABILITY']).optional(),
  }),
});

router.route('/').get(getSuppliers).post(validate(supplierSchema), createSupplier);
router.route('/:id').get(getSupplierById).put(updateSupplier).delete(deleteSupplier);

export default router;
