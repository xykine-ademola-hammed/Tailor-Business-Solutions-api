"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStats = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const emailService_1 = __importDefault(require("../services/emailService"));
const getOrders = async (req, res) => {
    try {
        const { status, customerId, page = 1, limit = 10, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (status)
            whereClause.status = status;
        if (customerId)
            whereClause.customerId = customerId;
        if (search) {
            whereClause[sequelize_1.Op.or] = [{ orderNumber: { [sequelize_1.Op.iLike]: `%${search}%` } }];
        }
        const { rows: orders, count } = await models_1.Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: models_1.Customer, as: "customer" },
                { model: models_1.OrderItem, as: "items" },
            ],
            limit: Number(limit),
            offset,
            order: [["orderDate", "DESC"]],
        });
        res.json({
            orders,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(count / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrders = getOrders;
const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await models_1.Order.findByPk(id, {
            include: [
                { model: models_1.Customer, as: "customer" },
                {
                    model: models_1.OrderItem,
                    as: "items",
                    include: [{ model: models_1.Product, as: "product" }],
                },
            ],
        });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrder = getOrder;
const createOrder = async (req, res) => {
    try {
        const { customer, customerPhone, customerEmail, orderDate, deliveryDate, items, advancePayment, notes, } = req.body;
        let findCustomer = await models_1.Customer.findOne({
            where: {
                email: customerEmail,
            },
        });
        if (!findCustomer) {
            findCustomer = await models_1.Customer.create({
                name: customer,
                email: customerEmail,
                phone: customerPhone,
            });
        }
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await models_1.Product.findByPk(item.productId);
            if (!product) {
                res.status(404).json({ error: `Product ${item.productId} not found` });
                return;
            }
            const itemTotal = Number(item.unitPrice) * Number(item.quantity);
            totalAmount += itemTotal;
            orderItems.push({
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: itemTotal,
                specifications: item.specifications,
            });
        }
        const orderNumber = `ORD-${Date.now()}`;
        const remainingPayment = totalAmount - Number(advancePayment || 0);
        const order = await models_1.Order.create({
            orderNumber,
            customerId: findCustomer.id,
            orderDate,
            deliveryDate,
            totalAmount,
            advancePayment: advancePayment || 0,
            remainingPayment,
            notes,
            status: models_1.OrderStatus.PENDING,
        });
        for (const item of orderItems) {
            await models_1.OrderItem.create({
                orderId: order.id,
                ...item,
            });
        }
        await findCustomer.update({
            totalSpent: Number(customer.totalSpent) + totalAmount,
            orderCount: customer.orderCount + 1,
        });
        // await emailService.sendOrderConfirmation(fullOrder!, findCustomer);
        res.status(201).json({
            message: "Order created successfully",
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createOrder = createOrder;
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, deliveryDate, notes } = req.body;
        const order = await models_1.Order.findByPk(id, {
            include: [{ model: models_1.Customer, as: "customer" }],
        });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        const oldStatus = order.status;
        await order.update({ status, deliveryDate, notes });
        if (status && status !== oldStatus) {
            await emailService_1.default.sendOrderStatusUpdate(order, order.customer);
        }
        res.json({
            message: "Order updated successfully",
            order,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await models_1.Order.findByPk(id, {
            include: [{ model: models_1.OrderItem, as: "items" }],
        });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        const customer = await models_1.Customer.findByPk(order.customerId);
        if (customer) {
            await customer.update({
                totalSpent: Number(customer.totalSpent) - Number(order.totalAmount),
                orderCount: Math.max(0, customer.orderCount - 1),
            });
        }
        await order.destroy();
        res.json({ message: "Order deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteOrder = deleteOrder;
const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await models_1.Order.count();
        const pendingOrders = await models_1.Order.count({
            where: { status: models_1.OrderStatus.PENDING },
        });
        const completedOrders = await models_1.Order.count({
            where: { status: models_1.OrderStatus.COMPLETED },
        });
        const totalRevenue = await models_1.Order.sum("totalAmount");
        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrderStats = getOrderStats;
//# sourceMappingURL=orderController.js.map