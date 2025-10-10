"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/dashboard', analyticsController_1.getDashboardStats);
router.get('/revenue', analyticsController_1.getRevenueAnalytics);
router.get('/top-products', analyticsController_1.getTopProducts);
router.get('/top-customers', analyticsController_1.getTopCustomers);
router.get('/order-trends', analyticsController_1.getOrderTrends);
router.get('/customer-insights', analyticsController_1.getCustomerInsights);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map