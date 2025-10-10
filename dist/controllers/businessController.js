"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBusiness = exports.updateBusiness = exports.createBusiness = exports.getBusiness = exports.getBusinesss = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const getBusinesss = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10, isActive } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (category)
            whereClause.category = category;
        if (isActive !== undefined)
            whereClause.isActive = isActive === "true";
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: businesss, count } = await models_1.Business.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset,
            order: [["name", "ASC"]],
        });
        res.json({
            businesss,
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
exports.getBusinesss = getBusinesss;
const getBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const business = await models_1.Business.findByPk(id);
        if (!business) {
            res.status(404).json({ error: "Business not found" });
            return;
        }
        res.json({ business });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBusiness = getBusiness;
const createBusiness = async (req, res) => {
    try {
        const { name, category, description, basePrice, materialCost, laborCost, imageUrl, } = req.body;
        const business = await models_1.Business.create({
            name,
            category,
            description,
            basePrice,
            materialCost: materialCost || 0,
            laborCost: laborCost || 0,
            imageUrl,
        });
        res.status(201).json({
            message: "Business created successfully",
            business,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createBusiness = createBusiness;
const updateBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, basePrice, materialCost, laborCost, imageUrl, isActive, } = req.body;
        const business = await models_1.Business.findByPk(id);
        if (!business) {
            res.status(404).json({ error: "Business not found" });
            return;
        }
        await business.update({
            name,
            category,
            description,
            basePrice,
            materialCost,
            laborCost,
            imageUrl,
            isActive,
        });
        res.json({
            message: "Business updated successfully",
            business,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateBusiness = updateBusiness;
const deleteBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const business = await models_1.Business.findByPk(id);
        if (!business) {
            res.status(404).json({ error: "Business not found" });
            return;
        }
        await business.destroy();
        res.json({ message: "Business deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteBusiness = deleteBusiness;
//# sourceMappingURL=businessController.js.map