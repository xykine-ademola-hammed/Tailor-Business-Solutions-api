import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getMyProducts,
  getProductDetail,
} from "../controllers/productController";
import { authenticate } from "../middleware/auth";
import multer from "multer";

const router = Router();

router.use(authenticate);

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getProducts);
router.get("/my", getMyProducts);
router.get("/categories", getProductCategories);
router.get("/:id", getProduct);
router.get("/detail/:id", getProductDetail);
router.post("/", upload.any(), createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
