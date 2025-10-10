"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', orderController_1.getOrders);
router.get('/stats', orderController_1.getOrderStats);
router.get('/:id', orderController_1.getOrder);
router.post('/', orderController_1.createOrder);
router.put('/:id', orderController_1.updateOrder);
router.delete('/:id', orderController_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map