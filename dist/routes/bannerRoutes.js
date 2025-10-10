"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bannerController_1 = require("../controllers/bannerController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/:businessId", bannerController_1.getBanner);
router.post("/", upload.any(), bannerController_1.createBanner);
router.put("/:id", bannerController_1.updateBanner);
router.delete("/:id", bannerController_1.deleteBanner);
exports.default = router;
//# sourceMappingURL=bannerRoutes.js.map