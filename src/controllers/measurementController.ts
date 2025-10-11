import e, { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Measurement, Customer } from "../models";
import { Op, fn, col, where as sqlWhere, literal } from "sequelize";

export const getMeasurements = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { customerId } = req.query;

    const whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;

    const measurements = await Measurement.findAll({
      where: whereClause,
      include: [{ model: Customer, as: "customer" }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ measurements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBusinessMeasurements = async (
  req: AuthRequest, // or AuthRequest
  res: Response
): Promise<void> => {
  try {
    const {
      businessId,
      search = "",
      page = "1",
      limit = "10",
    } = req.query as {
      businessId?: string;
      search?: string;
      page?: string;
      limit?: string;
    };

    if (!businessId) {
      res.status(400).json({ error: "businessId is required." });
      return;
    }

    // Coerce & clamp pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(String(limit), 10) || 10)
    );
    const offset = (pageNum - 1) * limitNum;

    // Case-insensitive search that works on all dialects by LOWER(...)
    const q = search.trim().toLowerCase();
    const hasSearch = q.length > 0;

    // WHERE on Measurement itself (add more fields if needed)
    const measurementWhere: any = {};
    if (hasSearch) {
      measurementWhere[Op.or] = [
        sqlWhere(fn("LOWER", col("Measurement.name")), { [Op.like]: `%${q}%` }),
        sqlWhere(fn("LOWER", col("Measurement.description")), {
          [Op.like]: `%${q}%`,
        }),
      ];
    }

    // Include Customer and constrain by businessId (tailorId)
    const includeCustomer = {
      model: Customer,
      as: "customer",
      required: true, // inner join so businessId filter is enforced
      where: {
        businessId: businessId,
        ...(hasSearch && {
          // also allow searching by customer name
          [Op.or]: [
            sqlWhere(fn("LOWER", col("customer.name")), {
              [Op.like]: `%${q}%`,
            }),
          ],
        }),
      },
      attributes: [
        "id",
        "name",
        "tailorId",
        "email",
        "phone",
        "businessId",
        "address",
        "gender",
        "age",
      ],
    };

    const { rows, count } = await Measurement.findAndCountAll({
      where: measurementWhere,
      include: [includeCustomer],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
      distinct: true, // IMPORTANT when using include to get correct count
    });

    res.json({
      measurements: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limitNum)),
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
};

export const getMeasurement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const measurement = await Measurement.findByPk(id, {
      include: [{ model: Customer, as: "customer" }],
    });

    if (!measurement) {
      res.status(404).json({ error: "Measurement not found" });
      return;
    }

    res.json({ measurement });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMeasurement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { customerId, garmentType, measurements, notes } = req.body;

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const measurement = await Measurement.create({
      customerId,
      garmentType,
      measurements,
      notes,
    });

    const fullMeasurement = await Measurement.findByPk(measurement.id, {
      include: [{ model: Customer, as: "customer" }],
    });

    res.status(201).json({
      message: "Measurement created successfully",
      measurement: fullMeasurement,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMeasurement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { garmentType, measurements, notes } = req.body;

    const measurement = await Measurement.findByPk(id);
    if (!measurement) {
      res.status(404).json({ error: "Measurement not found" });
      return;
    }

    await measurement.update({ garmentType, measurements, notes });

    const updatedMeasurement = await Measurement.findByPk(id, {
      include: [{ model: Customer, as: "customer" }],
    });

    res.json({
      message: "Measurement updated successfully",
      measurement: updatedMeasurement,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMeasurement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const measurement = await Measurement.findByPk(id);
    if (!measurement) {
      res.status(404).json({ error: "Measurement not found" });
      return;
    }

    await measurement.destroy();

    res.json({ message: "Measurement deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
