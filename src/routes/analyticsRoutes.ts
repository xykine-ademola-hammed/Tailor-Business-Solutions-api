import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getTopProducts,
  getTopCustomers,
  getOrderTrends,
  getCustomerInsights
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/top-products', getTopProducts);
router.get('/top-customers', getTopCustomers);
router.get('/order-trends', getOrderTrends);
router.get('/customer-insights', getCustomerInsights);

export default router;
