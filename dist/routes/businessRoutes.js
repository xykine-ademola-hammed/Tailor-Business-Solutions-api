"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const businessController_1 = require("../controllers/businessController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", businessController_1.getBusinesss);
router.get("/:id", businessController_1.getBusiness);
router.post("/", businessController_1.createBusiness);
router.put("/:id", businessController_1.updateBusiness);
router.delete("/:id", businessController_1.deleteBusiness);
exports.default = router;
//# sourceMappingURL=businessRoutes.js.map