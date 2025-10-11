import { Router } from "express";
import {
  getMeasurements,
  getMeasurement,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getBusinessMeasurements,
} from "../controllers/measurementController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getMeasurements);
router.get("/business", getBusinessMeasurements);
router.get("/:id", getMeasurement);
router.post("/", createMeasurement);
router.put("/:id", updateMeasurement);
router.delete("/:id", deleteMeasurement);

export default router;
