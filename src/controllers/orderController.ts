import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Order, OrderItem, Customer, Product, OrderStatus } from "../models";
import { Op } from "sequelize";
import emailService from "../services/emailService";

export const getOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, customerId, page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (customerId) whereClause.customerId = customerId;
    if (search) {
      whereClause[Op.or] = [{ orderNumber: { [Op.iLike]: `%${search}%` } }];
    }

    const { rows: orders, count } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        { model: Customer, as: "customer" },
        { model: OrderItem, as: "items" },
      ],
      limit: Number(limit),
      offset,
      order: [["orderDate", "DESC"]],
    });

    res.json({
      orders,
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

export const getOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: Customer, as: "customer" },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      customer,
      customerPhone,
      customerEmail,
      orderDate,
      deliveryDate,
      items,
      advancePayment,
      notes,
    } = req.body;

    let findCustomer = await Customer.findOne({
      where: {
        email: customerEmail,
      },
    });
    if (!findCustomer) {
      findCustomer = await Customer.create({
        name: customer,
        email: customerEmail,
        phone: customerPhone,
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        res.status(404).json({ error: `Product ${item.productId} not found` });
        return;
      }

      const itemTotal = Number(item.unitPrice) * Number(item.quantity);
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
        specifications: item.specifications,
      });
    }

    const orderNumber = `ORD-${Date.now()}`;
    const remainingPayment = totalAmount - Number(advancePayment || 0);

    const order = await Order.create({
      orderNumber,
      customerId: findCustomer.id,
      orderDate,
      deliveryDate,
      totalAmount,
      advancePayment: advancePayment || 0,
      remainingPayment,
      notes,
      status: OrderStatus.PENDING,
    });

    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item,
      });
    }

    await findCustomer.update({
      totalSpent: Number(customer.totalSpent) + totalAmount,
      orderCount: customer.orderCount + 1,
    });

    // await emailService.sendOrderConfirmation(fullOrder!, findCustomer);

    res.status(201).json({
      message: "Order created successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, deliveryDate, notes } = req.body;

    const order = await Order.findByPk(id, {
      include: [{ model: Customer, as: "customer" }],
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const oldStatus = order.status;
    await order.update({ status, deliveryDate, notes });

    if (status && status !== oldStatus) {
      await emailService.sendOrderStatusUpdate(order, order.customer);
    }

    res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const customer = await Customer.findByPk(order.customerId);
    if (customer) {
      await customer.update({
        totalSpent: Number(customer.totalSpent) - Number(order.totalAmount),
        orderCount: Math.max(0, customer.orderCount - 1),
      });
    }

    await order.destroy();

    res.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({
      where: { status: OrderStatus.PENDING },
    });
    const completedOrders = await Order.count({
      where: { status: OrderStatus.COMPLETED },
    });

    const totalRevenue = await Order.sum("totalAmount");

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
