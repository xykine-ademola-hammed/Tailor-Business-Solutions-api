import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Business, Product, ProductCategory, ProductDocument } from "../models";
import { Op } from "sequelize";
import s3Service from "../services/s3Service";
import { promises as fs } from "fs";

export const getProducts = async (
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

// import { Business, Product, ProductDocument } from "..."; // your models
// import { s3Service } from "...";                        // your S3 wrapper
// import type { AuthRequest } from "...";                 // your auth request type

const sanitizeFilename = (name: string) => name.replace(/[^\w.\-]+/g, "_");

export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    /** ------------------------------------------------------------
     * Support multipart/form-data where "product" is a JSON field
     * and files come in as images / images[] (via Multer).
     * ------------------------------------------------------------ */
    const raw =
      typeof (req.body as any)?.product === "string"
        ? JSON.parse((req.body as any).product)
        : req.body ?? {};

    const {
      name,
      unit,
      description,
      availableDesigns = [],
      fabricTypes = [], // [{ name: string, cost: number }]
      availableColors = [],
    } = raw;

    if (!name || !unit) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: name and unit.",
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
    const product = await Product.create({
      name,
      options: {
        availableColors,
        availableDesigns,
        fabricTypes,
      },
      lowPrice,
      highPrice,
      description,
      unit,
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
      files =
        (grouped.files["images"] as Express.Multer.File[]) ||
        (grouped.files["images[]"] as Express.Multer.File[]) ||
        [];
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

    let mainImageUrl: string | null = null;

    if (files.length > 0) {
      await Promise.all(
        files.map(async (file, index) => {
          // Get a Buffer for S3:
          //  - memoryStorage: file.buffer
          //  - diskStorage: read from file.path
          let body: Buffer;
          if (file.buffer) {
            body = file.buffer; // ✅ Multer memoryStorage
          } else if ((file as any).path) {
            body = await fs.readFile((file as any).path); // ✅ Multer diskStorage
          } else {
            throw new Error("Uploaded file missing buffer/path");
          }

          const key = `products/${product.id}/${Date.now()}-${sanitizeFilename(
            file.originalname
          )}`;

          // Your s3Service should accept a Buffer here
          // e.g., uploadFile(body: Buffer, key: string, contentType: string): Promise<string>
          const url = await s3Service.uploadFile(body, key, file.mimetype);

          if (!url) {
            throw new Error("Failed to upload file to S3.");
          }
          if (index === 0) {
            await product.update({ imageUrl: url });
          }

          await ProductDocument.create({
            entityId: Number(product.id),
            entityType: "PRODUCT",
            url,
            createdBy: req?.user?.id,
            mimeType: file.mimetype,
            fileName: file.originalname,
          });

          // Set first image as main image (skip PDFs)
          if (!mainImageUrl && file.mimetype.startsWith("image/")) {
            mainImageUrl = url;
          }
        })
      );

      if (mainImageUrl) {
        await product.update({ mainImageUrl });
      }
    }

    /** ------------------------------------------------------------
     * Respond
     * ------------------------------------------------------------ */
    const full = await Product.findByPk(product.id); // refresh with mainImageUrl
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
