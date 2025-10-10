"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceEmail = exports.generateInvoicePDF = exports.deleteInvoice = exports.updateInvoice = exports.createInvoice = exports.getInvoice = exports.getInvoices = void 0;
const models_1 = require("../models");
const pdfService_1 = __importDefault(require("../services/pdfService"));
const emailService_1 = __importDefault(require("../services/emailService"));
const s3Service_1 = __importDefault(require("../services/s3Service"));
const getInvoices = async (req, res) => {
    try {
        const { status, customerId, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (status)
            whereClause.status = status;
        if (customerId)
            whereClause.customerId = customerId;
        const { rows: invoices, count } = await models_1.Invoice.findAndCountAll({
            where: whereClause,
            include: [
                { model: models_1.Order, as: 'order' },
                { model: models_1.Customer, as: 'customer' }
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getInvoices = getInvoices;
const getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await models_1.Invoice.findByPk(id, {
            include: [
                { model: models_1.Order, as: 'order' },
                { model: models_1.Customer, as: 'customer' }
            ]
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        res.json({ invoice });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getInvoice = getInvoice;
const createInvoice = async (req, res) => {
    try {
        const { orderId, invoiceDate, dueDate, tax, discount, notes } = req.body;
        const order = await models_1.Order.findByPk(orderId);
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        const customer = await models_1.Customer.findByPk(order.customerId);
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
        const invoice = await models_1.Invoice.create({
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
            status: models_1.InvoiceStatus.DRAFT
        });
        const fullInvoice = await models_1.Invoice.findByPk(invoice.id, {
            include: [
                { model: models_1.Order, as: 'order' },
                { model: models_1.Customer, as: 'customer' }
            ]
        });
        res.status(201).json({
            message: 'Invoice created successfully',
            invoice: fullInvoice
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createInvoice = createInvoice;
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, dueDate, tax, discount, notes } = req.body;
        const invoice = await models_1.Invoice.findByPk(id);
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        const updateData = {};
        if (status)
            updateData.status = status;
        if (dueDate)
            updateData.dueDate = dueDate;
        if (notes !== undefined)
            updateData.notes = notes;
        if (tax !== undefined || discount !== undefined) {
            const newTax = tax !== undefined ? Number(tax) : Number(invoice.tax);
            const newDiscount = discount !== undefined ? Number(discount) : Number(invoice.discount);
            updateData.tax = newTax;
            updateData.discount = newDiscount;
            updateData.total = Number(invoice.subtotal) + newTax - newDiscount;
        }
        await invoice.update(updateData);
        const updatedInvoice = await models_1.Invoice.findByPk(id, {
            include: [
                { model: models_1.Order, as: 'order' },
                { model: models_1.Customer, as: 'customer' }
            ]
        });
        res.json({
            message: 'Invoice updated successfully',
            invoice: updatedInvoice
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await models_1.Invoice.findByPk(id);
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        await invoice.destroy();
        res.json({ message: 'Invoice deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteInvoice = deleteInvoice;
const generateInvoicePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await models_1.Invoice.findByPk(id);
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        const pdfBuffer = await pdfService_1.default.generateInvoicePDF(invoice);
        const pdfUrl = await s3Service_1.default.uploadInvoicePDF(pdfBuffer, invoice.invoiceNumber);
        await invoice.update({ pdfUrl });
        res.json({
            message: 'Invoice PDF generated successfully',
            pdfUrl
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.generateInvoicePDF = generateInvoicePDF;
const sendInvoiceEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await models_1.Invoice.findByPk(id, {
            include: [
                { model: models_1.Customer, as: 'customer' }
            ]
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        let pdfBuffer;
        if (!invoice.pdfUrl) {
            pdfBuffer = await pdfService_1.default.generateInvoicePDF(invoice);
            const pdfUrl = await s3Service_1.default.uploadInvoicePDF(pdfBuffer, invoice.invoiceNumber);
            await invoice.update({ pdfUrl });
        }
        await emailService_1.default.sendInvoice(invoice, invoice.customer, pdfBuffer);
        await invoice.update({ status: models_1.InvoiceStatus.SENT });
        res.json({ message: 'Invoice sent successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendInvoiceEmail = sendInvoiceEmail;
//# sourceMappingURL=invoiceController.js.map