import { Router } from "express";
import {
  getBusinesss,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from "../controllers/businessController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getBusinesss);
router.get("/:id", getBusiness);
router.post("/", createBusiness);
router.put("/:id", updateBusiness);
router.delete("/:id", deleteBusiness);

export default router;
