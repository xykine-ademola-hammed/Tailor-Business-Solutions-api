import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Business } from "../models";
import { Op } from "sequelize";

export const getBusinesss = async (
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

    const { rows: businesss, count } = await Business.findAndCountAll({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBusiness = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    res.json({ business });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBusiness = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      category,
      description,
      basePrice,
      materialCost,
      laborCost,
      imageUrl,
    } = req.body;

    const business = await Business.create({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBusiness = async (
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

    const business = await Business.findByPk(id);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBusiness = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    await business.destroy();

    res.json({ message: "Business deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
