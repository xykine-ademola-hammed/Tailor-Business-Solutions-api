import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Invoice, Order, Customer, InvoiceStatus } from '../models';
import pdfService from '../services/pdfService';
import emailService from '../services/emailService';
import s3Service from '../services/s3Service';

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, customerId, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (customerId) whereClause.customerId = customerId;

    const { rows: invoices, count } = await Invoice.findAndCountAll({
      where: whereClause,
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' }
      ],
      limit: Number(limit),
      offset,
      order: [['invoiceDate', 'DESC']]
    });

    res.json({
      invoices,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' }
      ]
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    res.json({ invoice });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      invoiceDate,
      dueDate,
      tax,
      discount,
      notes
    } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const customer = await Customer.findByPk(order.customerId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const subtotal = Number(order.totalAmount);
    const taxAmount = Number(tax || 0);
    const discountAmount = Number(discount || 0);
    const total = subtotal + taxAmount - discountAmount;

    const timestamp = Date.now();
    const invoiceNumber = `INV-${timestamp}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      orderId,
      customerId: customer.id,
      invoiceDate,
      dueDate,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      notes,
      status: InvoiceStatus.DRAFT
    });

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' }
      ]
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: fullInvoice
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, dueDate, tax, discount, notes } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (dueDate) updateData.dueDate = dueDate;
    if (notes !== undefined) updateData.notes = notes;

    if (tax !== undefined || discount !== undefined) {
      const newTax = tax !== undefined ? Number(tax) : Number(invoice.tax);
      const newDiscount = discount !== undefined ? Number(discount) : Number(invoice.discount);
      updateData.tax = newTax;
      updateData.discount = newDiscount;
      updateData.total = Number(invoice.subtotal) + newTax - newDiscount;
    }

    await invoice.update(updateData);

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' }
      ]
    });

    res.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    await invoice.destroy();

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generateInvoicePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const pdfBuffer = await pdfService.generateInvoicePDF(invoice);

    const pdfUrl = await s3Service.uploadInvoicePDF(pdfBuffer, invoice.invoiceNumber);

    await invoice.update({ pdfUrl });

    res.json({
      message: 'Invoice PDF generated successfully',
      pdfUrl
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendInvoiceEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' }
      ]
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    let pdfBuffer;
    if (!invoice.pdfUrl) {
      pdfBuffer = await pdfService.generateInvoicePDF(invoice);
      const pdfUrl = await s3Service.uploadInvoicePDF(pdfBuffer, invoice.invoiceNumber);
      await invoice.update({ pdfUrl });
    }

    await emailService.sendInvoice(invoice, invoice.customer, pdfBuffer);

    await invoice.update({ status: InvoiceStatus.SENT });

    res.json({ message: 'Invoice sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
