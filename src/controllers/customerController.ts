import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Customer, Order, Measurement } from "../models";
import { Op } from "sequelize";

export const getCustomers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: customers, count } = await Customer.findAndCountAll({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyCustomers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    console.log(whereClause);

    const { rows: customers, count } = await Customer.findAndCountAll({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [
        { model: Order, as: "orders" },
        { model: Measurement, as: "measurements" },
      ],
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({ customer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, address, city, notes } = req.body;

    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      res
        .status(400)
        .json({ error: "Customer with this email already exists" });
      return;
    }

    const customer = await Customer.create({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, notes } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ where: { email } });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    await customer.destroy();

    res.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalCustomers = await Customer.count();
    const activeCustomers = await Customer.count({
      where: {
        orderCount: { [Op.gt]: 0 },
      },
    });

    const topCustomers = await Customer.findAll({
      limit: 5,
      order: [["totalSpent", "DESC"]],
    });

    res.json({
      totalCustomers,
      activeCustomers,
      topCustomers,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
