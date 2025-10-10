"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerStats = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getMyCustomers = exports.getCustomers = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const getCustomers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { email: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { phone: { [sequelize_1.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: customers, count } = await models_1.Customer.findAndCountAll({
            where: { ...whereClause },
            limit: Number(limit),
            offset,
            order: [["createdAt", "DESC"]],
        });
        res.json({
            customers,
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
exports.getCustomers = getCustomers;
const getMyCustomers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { email: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { phone: { [sequelize_1.Op.iLike]: `%${search}%` } },
            ];
        }
        console.log(whereClause);
        const { rows: customers, count } = await models_1.Customer.findAndCountAll({
            where: { tailorId: req?.user?.id },
            limit: Number(limit),
            offset,
            order: [["createdAt", "DESC"]],
        });
        res.json({
            customers,
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
exports.getMyCustomers = getMyCustomers;
const getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await models_1.Customer.findByPk(id, {
            include: [
                { model: models_1.Order, as: "orders" },
                { model: models_1.Measurement, as: "measurements" },
            ],
        });
        if (!customer) {
            res.status(404).json({ error: "Customer not found" });
            return;
        }
        res.json({ customer });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCustomer = getCustomer;
const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, city, notes } = req.body;
        const existingCustomer = await models_1.Customer.findOne({ where: { email } });
        if (existingCustomer) {
            res
                .status(400)
                .json({ error: "Customer with this email already exists" });
            return;
        }
        const customer = await models_1.Customer.create({
            name,
            email,
            phone,
            address,
            tailorId: req?.user?.id,
            city,
            notes,
        });
        res.status(201).json({
            message: "Customer created successfully",
            customer,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, city, notes } = req.body;
        const customer = await models_1.Customer.findByPk(id);
        if (!customer) {
            res.status(404).json({ error: "Customer not found" });
            return;
        }
        if (email && email !== customer.email) {
            const existingCustomer = await models_1.Customer.findOne({ where: { email } });
            if (existingCustomer) {
                res.status(400).json({ error: "Email already exists" });
                return;
            }
        }
        await customer.update({ name, email, phone, address, city, notes });
        res.json({
            message: "Customer updated successfully",
            customer,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await models_1.Customer.findByPk(id);
        if (!customer) {
            res.status(404).json({ error: "Customer not found" });
            return;
        }
        await customer.destroy();
        res.json({ message: "Customer deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCustomer = deleteCustomer;
const getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await models_1.Customer.count();
        const activeCustomers = await models_1.Customer.count({
            where: {
                orderCount: { [sequelize_1.Op.gt]: 0 },
            },
        });
        const topCustomers = await models_1.Customer.findAll({
            limit: 5,
            order: [["totalSpent", "DESC"]],
        });
        res.json({
            totalCustomers,
            activeCustomers,
            topCustomers,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCustomerStats = getCustomerStats;
//# sourceMappingURL=customerController.js.map