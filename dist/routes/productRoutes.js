"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/", productController_1.getProducts);
router.get("/my", productController_1.getMyProducts);
router.get("/categories", productController_1.getProductCategories);
router.get("/:id", productController_1.getProduct);
router.post("/", upload.any(), productController_1.createProduct);
router.put("/:id", productController_1.updateProduct);
router.delete("/:id", productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map