import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Business, Banner, Document } from "../models";
import { Op } from "sequelize";
import s3Service from "../services/s3Service";
import { promises as fs } from "fs";

export const getBanner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("----businessId-11111--");

    const { businessId } = req.params;

    console.log("----businessId---", businessId);

    const banner = await Banner.findOne({
      where: { businessId },
      include: [{ model: Document, as: "documents" }],
    });

    if (!banner) {
      res.status(404).json({ error: "Banner not found" });
      return;
    }

    res.json({ banner });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const sanitizeFilename = (name: string) => name.replace(/[^\w.\-]+/g, "_");

export const createBanner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, businessId } = req.body;

    /** ------------------------------------------------------------
     * Create Banner
     * ------------------------------------------------------------ */
    const newBanner = await Banner.create({
      title,
      description,
      businessId,
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
            file.originalname.trim(),
            file.mimetype
          );

          if (!url) {
            throw new Error("Failed to upload file to S3.");
          }
          if (index === 0) {
            await newBanner.update({ imageUrl: url });
          }

          await Document.create({
            entityId: newBanner.id,
            entityType: "BANNER",
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
    const full = await Banner.findByPk(newBanner.id); // refresh with mainImageUrl
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner: full,
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const updateBanner = async (
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

    const banner = await Banner.findByPk(id);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBanner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      res.status(404).json({ error: "Banner not found" });
      return;
    }

    await banner.destroy();

    res.json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
