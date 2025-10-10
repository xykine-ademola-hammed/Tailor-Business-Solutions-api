import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Business, Product, ProductCategory, Document } from "../models";
import { Op } from "sequelize";
import s3Service from "../services/s3Service";
import { promises as fs } from "fs";

export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 10, isActive } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive === "true";
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: products, count } = await Product.findAndCountAll({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      businessId,
      category,
      search,
      page = 1,
      limit = 10,
      isActive,
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive === "true";
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: products, count } = await Product.findAndCountAll({
      where: { businessId },
      limit: Number(limit),
      offset,
      order: [["name", "ASC"]],
      include: [{ model: Document, as: "documents" }],
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// import { Business, Product, Document } from "..."; // your models
// import { s3Service } from "...";                        // your S3 wrapper
// import type { AuthRequest } from "...";                 // your auth request type

const sanitizeFilename = (name: string) => name.replace(/[^\w.\-]+/g, "_");

export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("Request body:", req.body);
    const product = JSON.parse(req.body.product);

    console.log("Received product data:", product);

    const {
      name,
      description,
      availableDesigns = [],
      fabricTypes = [], // [{ name: string, cost: number }]
      availableColors = [],
    } = product;

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
    const business = await Business.findOne({
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
          .map((f: any) => Number(f?.cost))
          .filter((n: number) => Number.isFinite(n))
      : [];

    const lowPrice = costs.length ? Math.min(...costs) : null;
    const highPrice = costs.length ? Math.max(...costs) : null;

    /** ------------------------------------------------------------
     * Create Product
     * ------------------------------------------------------------ */
    const newProduct = await Product.create({
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
    let files: Express.Multer.File[] = [];
    if (Array.isArray((req as any).files)) {
      files = (req as any).files as Express.Multer.File[];
    } else if ((req as any).files && typeof (req as any).files === "object") {
      const grouped = req as any;
      files = grouped.files["images"] as Express.Multer.File[];
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
      await Promise.all(
        files.map(async (file, index) => {
          let body: Buffer;
          if (file.buffer) {
            body = file.buffer;
          } else if ((file as any).path) {
            body = await fs.readFile((file as any).path); // ✅ Multer diskStorage
          } else {
            throw new Error("Uploaded file missing buffer/path");
          }

          const url = await s3Service.uploadFile(
            body,
            sanitizeFilename(file.originalname),
            file.mimetype
          );

          if (!url) {
            throw new Error("Failed to upload file to S3.");
          }
          if (index === 0) {
            await newProduct.update({ imageUrl: url });
          }

          console.log("New Document:", newProduct.id);

          await Document.create({
            entityId: newProduct.id,
            entityType: "PRODUCT",
            url,
            createdBy: req?.user?.id,
            mimeType: file.mimetype,
            fileName: file.originalname,
          });
        })
      );
    }

    /** ------------------------------------------------------------
     * Respond
     * ------------------------------------------------------------ */
    const full = await Product.findByPk(newProduct.id);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: full,
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      basePrice,
      materialCost,
      laborCost,
      imageUrl,
      isActive,
    } = req.body;

    const product = await Product.findByPk(id);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const categories = Object.values(ProductCategory);
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
