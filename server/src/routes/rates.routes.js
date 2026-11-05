import { Router } from 'express';
import { getCorridorRates, getAllCorridorsSummary } from '../controllers/rates.controller.js';

const router = Router();

router.get('/corridors', getAllCorridorsSummary);
router.get('/quote', getCorridorRates);

export default router;
