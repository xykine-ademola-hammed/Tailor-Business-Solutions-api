import { Router } from "express";
import {
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController";
import { authenticate } from "../middleware/auth";
import multer from "multer";

const router = Router();

router.use(authenticate);

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:businessId", getBanner);
router.post("/", upload.any(), createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

export default router;
