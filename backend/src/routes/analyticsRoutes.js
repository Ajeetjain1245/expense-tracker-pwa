import express from 'express';
import {
  getSummary,
  getTrends,
  getCategoryBreakdown,
  getPaymentModeSplit
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all analytics routes
router.use(protect);

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/categories', getCategoryBreakdown);
router.get('/payment-modes', getPaymentModeSplit);

export default router;
