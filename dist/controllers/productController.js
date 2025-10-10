"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductCategories = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getMyProducts = exports.getProducts = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const s3Service_1 = __importDefault(require("../services/s3Service"));
const fs_1 = require("fs");
const getProducts = async (req, res) => {
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
        const { rows: products, count } = await models_1.Product.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset,
            order: [["name", "ASC"]],
        });
        res.json({
            products,
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
exports.getProducts = getProducts;
const getMyProducts = async (req, res) => {
    try {
        const { businessId, category, search, page = 1, limit = 10, isActive, } = req.query;
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
        const { rows: products, count } = await models_1.Product.findAndCountAll({
            where: { businessId },
            limit: Number(limit),
            offset,
            order: [["name", "ASC"]],
            include: [{ model: models_1.Document, as: "documents" }],
        });
        res.json({
            products,
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
exports.getMyProducts = getMyProducts;
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await models_1.Product.findByPk(id);
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json({ product });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProduct = getProduct;
// import { Business, Product, Document } from "..."; // your models
// import { s3Service } from "...";                        // your S3 wrapper
// import type { AuthRequest } from "...";                 // your auth request type
const sanitizeFilename = (name) => name.replace(/[^\w.\-]+/g, "_");
const createProduct = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const product = JSON.parse(req.body.product);
        console.log("Received product data:", product);
        const { name, description, availableDesigns = [], fabricTypes = [], // [{ name: string, cost: number }]
        availableColors = [], } = product;
        if (!name) {
            res.status(400).json({
                success: false,
                error: "Missing required fields: name.",
            });
            return;
        }
        /** ------------------------------------------------------------
         * Find Business
         * ------------------------------------------------------------ */
        const business = await models_1.Business.findOne({
            where: { ownerId: req?.user?.id },
        });
        if (!business) {
            res.status(404).json({ success: false, error: "Business Not Found" });
            return;
        }
        /** ------------------------------------------------------------
         * Compute low/high price from fabricTypes
         * ------------------------------------------------------------ */
        const costs = Array.isArray(fabricTypes)
            ? fabricTypes
                .map((f) => Number(f?.cost))
                .filter((n) => Number.isFinite(n))
            : [];
        const lowPrice = costs.length ? Math.min(...costs) : null;
        const highPrice = costs.length ? Math.max(...costs) : null;
        /** ------------------------------------------------------------
         * Create Product
         * ------------------------------------------------------------ */
        const newProduct = await models_1.Product.create({
            name,
            options: {
                availableColors,
                availableDesigns,
                fabricTypes,
            },
            lowPrice,
            highPrice,
            description,
            businessId: business.id,
        });
        /** ------------------------------------------------------------
         * Collect Files (Multer)
         *  - supports .array('images') or .fields([{ name: 'images[]' }])
         * ------------------------------------------------------------ */
        let files = [];
        if (Array.isArray(req.files)) {
            files = req.files;
        }
        else if (req.files && typeof req.files === "object") {
            const grouped = req;
            files = grouped.files["images"];
        }
        /** ------------------------------------------------------------
         * Validate and Upload each file
         * ------------------------------------------------------------ */
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        const maxSize = 5 * 1024 * 1024; // 5MB
        // Pre-validate all files first
        for (const file of files) {
            if (!allowedTypes.includes(file.mimetype)) {
                res.status(400).json({
                    success: false,
                    error: "Invalid file type. Only JPEG, PNG, and PDF are allowed.",
                });
                return;
            }
            if (file.size > maxSize) {
                res.status(400).json({
                    success: false,
                    error: "File size exceeds 5MB limit.",
                });
                return;
            }
        }
        if (files.length > 0) {
            await Promise.all(files.map(async (file, index) => {
                let body;
                if (file.buffer) {
                    body = file.buffer;
                }
                else if (file.path) {
                    body = await fs_1.promises.readFile(file.path); // ✅ Multer diskStorage
                }
                else {
                    throw new Error("Uploaded file missing buffer/path");
                }
                const url = await s3Service_1.default.uploadFile(body, sanitizeFilename(file.originalname), file.mimetype);
                if (!url) {
                    throw new Error("Failed to upload file to S3.");
                }
                if (index === 0) {
                    await newProduct.update({ imageUrl: url });
                }
                console.log("New Document:", newProduct.id);
                await models_1.Document.create({
                    entityId: newProduct.id,
                    entityType: "PRODUCT",
                    url,
                    createdBy: req?.user?.id,
                    mimeType: file.mimetype,
                    fileName: file.originalname,
                });
            }));
        }
        /** ------------------------------------------------------------
         * Respond
         * ------------------------------------------------------------ */
        const full = await models_1.Product.findByPk(newProduct.id);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: full,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, error: error?.message ?? "Server error" });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, basePrice, materialCost, laborCost, imageUrl, isActive, } = req.body;
        const product = await models_1.Product.findByPk(id);
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        await product.update({
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
            message: "Product updated successfully",
            product,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await models_1.Product.findByPk(id);
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        await product.destroy();
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const getProductCategories = async (req, res) => {
    try {
        const categories = Object.values(models_1.ProductCategory);
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProductCategories = getProductCategories;
//# sourceMappingURL=productController.js.map