import { Router } from 'express';
import {
  getMeasurements,
  getMeasurement,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement
} from '../controllers/measurementController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMeasurements);
router.get('/:id', getMeasurement);
router.post('/', createMeasurement);
router.put('/:id', updateMeasurement);
router.delete('/:id', deleteMeasurement);

export default router;
