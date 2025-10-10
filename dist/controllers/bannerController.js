"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getBanner = void 0;
const models_1 = require("../models");
const s3Service_1 = __importDefault(require("../services/s3Service"));
const fs_1 = require("fs");
const getBanner = async (req, res) => {
    try {
        console.log("----businessId-11111--");
        const { businessId } = req.params;
        console.log("----businessId---", businessId);
        const banner = await models_1.Banner.findOne({
            where: { businessId },
            include: [{ model: models_1.Document, as: "documents" }],
        });
        if (!banner) {
            res.status(404).json({ error: "Banner not found" });
            return;
        }
        res.json({ banner });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBanner = getBanner;
const sanitizeFilename = (name) => name.replace(/[^\w.\-]+/g, "_");
const createBanner = async (req, res) => {
    try {
        const { title, description, businessId } = req.body;
        /** ------------------------------------------------------------
         * Create Banner
         * ------------------------------------------------------------ */
        const newBanner = await models_1.Banner.create({
            title,
            description,
            businessId,
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
                const url = await s3Service_1.default.uploadFile(body, file.originalname.trim(), file.mimetype);
                if (!url) {
                    throw new Error("Failed to upload file to S3.");
                }
                if (index === 0) {
                    await newBanner.update({ imageUrl: url });
                }
                await models_1.Document.create({
                    entityId: newBanner.id,
                    entityType: "BANNER",
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
        const full = await models_1.Banner.findByPk(newBanner.id); // refresh with mainImageUrl
        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            banner: full,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, error: error?.message ?? "Server error" });
    }
};
exports.createBanner = createBanner;
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, basePrice, materialCost, laborCost, imageUrl, isActive, } = req.body;
        const banner = await models_1.Banner.findByPk(id);
        if (!banner) {
            res.status(404).json({ error: "Banner not found" });
            return;
        }
        await banner.update({
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
            message: "Banner updated successfully",
            banner,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateBanner = updateBanner;
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await models_1.Banner.findByPk(id);
        if (!banner) {
            res.status(404).json({ error: "Banner not found" });
            return;
        }
        await banner.destroy();
        res.json({ message: "Banner deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteBanner = deleteBanner;
//# sourceMappingURL=bannerController.js.map