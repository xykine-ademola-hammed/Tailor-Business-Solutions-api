import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Order, Customer, OrderItem, Product, OrderStatus } from "../models";
import { Op } from "sequelize";
import sequelize from "../config/database";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalRevenue = (await Order.sum("totalAmount")) || 0;
    const totalOrders = await Order.count();
    const totalCustomers = await Customer.count();
    const pendingOrders = await Order.count({
      where: { status: OrderStatus.PENDING },
    });

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      pendingOrders,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRevenueAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, period = "daily" } = req.query;

    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.orderDate = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    const orders = await Order.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn("DATE", sequelize.col("orderDate")), "date"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orders"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("orderDate"))],
      order: [[sequelize.fn("DATE", sequelize.col("orderDate")), "ASC"]],
      raw: true,
    });

    res.json({ analytics: orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await OrderItem.findAll({
      attributes: [
        "productId",
        "productName",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "totalRevenue"],
      ],
      group: ["productId", "productName"],
      order: [[sequelize.fn("SUM", sequelize.col("totalPrice")), "DESC"]],
      limit: Number(limit),
      raw: true,
    });

    res.json({ topProducts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopCustomers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const topCustomers = await Customer.findAll({
      limit: Number(limit),
      order: [["totalSpent", "DESC"]],
      attributes: ["id", "name", "email", "totalSpent", "orderCount"],
    });

    res.json({ topCustomers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderTrends = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.orderDate = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    const trends = await Order.findAll({
      where: whereClause,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    res.json({ trends });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerInsights = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const activeCustomers = await Customer.count({
      where: { orderCount: { [Op.gt]: 0 } },
    });

    const newCustomersThisMonth = await Customer.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ),
        },
      },
    });

    const avgOrderValue = await Order.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("totalAmount")), "avgValue"],
      ],
      raw: true,
    });

    res.json({
      activeCustomers,
      newCustomersThisMonth,
      // avgOrderValue: avgOrderValue ? Number(avgOrderValue.avgValue) : 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
