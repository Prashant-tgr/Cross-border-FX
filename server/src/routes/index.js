import { Router } from 'express';
import authRoutes from './auth.routes.js';
import ratesRoutes from './rates.routes.js';
import routingRoutes from './routing.routes.js';
import suppliersRoutes from './suppliers.routes.js';
import transfersRoutes from './transfers.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rates', ratesRoutes);
router.use('/routing', routingRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/transfers', transfersRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Cross-Border FX Spread & Remittance Router Backend',
  });
});

export default router;
