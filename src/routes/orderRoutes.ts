import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
