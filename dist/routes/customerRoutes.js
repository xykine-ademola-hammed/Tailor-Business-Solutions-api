"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", customerController_1.getCustomers);
router.get("/my", customerController_1.getMyCustomers);
router.get("/stats", customerController_1.getCustomerStats);
router.get("/:id", customerController_1.getCustomer);
router.post("/", customerController_1.createCustomer);
router.put("/:id", customerController_1.updateCustomer);
router.delete("/:id", customerController_1.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map