"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerInsights = exports.getOrderTrends = exports.getTopCustomers = exports.getTopProducts = exports.getRevenueAnalytics = exports.getDashboardStats = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const getDashboardStats = async (req, res) => {
    try {
        const totalRevenue = (await models_1.Order.sum("totalAmount")) || 0;
        const totalOrders = await models_1.Order.count();
        const totalCustomers = await models_1.Customer.count();
        const pendingOrders = await models_1.Order.count({
            where: { status: models_1.OrderStatus.PENDING },
        });
        res.json({
            totalRevenue,
            totalOrders,
            totalCustomers,
            pendingOrders,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
const getRevenueAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, period = "daily" } = req.query;
        const whereClause = {};
        if (startDate && endDate) {
            whereClause.orderDate = {
                [sequelize_1.Op.between]: [
                    new Date(startDate),
                    new Date(endDate),
                ],
            };
        }
        const orders = await models_1.Order.findAll({
            where: whereClause,
            attributes: [
                [database_1.default.fn("DATE", database_1.default.col("orderDate")), "date"],
                [database_1.default.fn("SUM", database_1.default.col("totalAmount")), "revenue"],
                [database_1.default.fn("COUNT", database_1.default.col("id")), "orders"],
            ],
            group: [database_1.default.fn("DATE", database_1.default.col("orderDate"))],
            order: [[database_1.default.fn("DATE", database_1.default.col("orderDate")), "ASC"]],
            raw: true,
        });
        res.json({ analytics: orders });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRevenueAnalytics = getRevenueAnalytics;
const getTopProducts = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const topProducts = await models_1.OrderItem.findAll({
            attributes: [
                "productId",
                "productName",
                [database_1.default.fn("SUM", database_1.default.col("quantity")), "totalQuantity"],
                [database_1.default.fn("SUM", database_1.default.col("totalPrice")), "totalRevenue"],
            ],
            group: ["productId", "productName"],
            order: [[database_1.default.fn("SUM", database_1.default.col("totalPrice")), "DESC"]],
            limit: Number(limit),
            raw: true,
        });
        res.json({ topProducts });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTopProducts = getTopProducts;
const getTopCustomers = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const topCustomers = await models_1.Customer.findAll({
            limit: Number(limit),
            order: [["totalSpent", "DESC"]],
            attributes: ["id", "name", "email", "totalSpent", "orderCount"],
        });
        res.json({ topCustomers });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTopCustomers = getTopCustomers;
const getOrderTrends = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};
        if (startDate && endDate) {
            whereClause.orderDate = {
                [sequelize_1.Op.between]: [
                    new Date(startDate),
                    new Date(endDate),
                ],
            };
        }
        const trends = await models_1.Order.findAll({
            where: whereClause,
            attributes: [
                "status",
                [database_1.default.fn("COUNT", database_1.default.col("id")), "count"],
            ],
            group: ["status"],
            raw: true,
        });
        res.json({ trends });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrderTrends = getOrderTrends;
const getCustomerInsights = async (req, res) => {
    try {
        const activeCustomers = await models_1.Customer.count({
            where: { orderCount: { [sequelize_1.Op.gt]: 0 } },
        });
        const newCustomersThisMonth = await models_1.Customer.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        });
        const avgOrderValue = await models_1.Order.findOne({
            attributes: [
                [database_1.default.fn("AVG", database_1.default.col("totalAmount")), "avgValue"],
            ],
            raw: true,
        });
        res.json({
            activeCustomers,
            newCustomersThisMonth,
            // avgOrderValue: avgOrderValue ? Number(avgOrderValue.avgValue) : 0
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCustomerInsights = getCustomerInsights;
//# sourceMappingURL=analyticsController.js.map