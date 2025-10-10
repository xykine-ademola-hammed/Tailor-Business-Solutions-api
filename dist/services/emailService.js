"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    async sendOrderConfirmation(order, customer) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: customer.email,
                subject: `Order Confirmation - ${order.orderNumber}`,
                html: `
          <h2>Order Confirmation</h2>
          <p>Dear ${customer.name},</p>
          <p>Your order has been confirmed.</p>
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</li>
            <li><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</li>
            <li><strong>Total Amount:</strong> $${order.totalAmount}</li>
            <li><strong>Advance Payment:</strong> $${order.advancePayment}</li>
            <li><strong>Remaining Payment:</strong> $${order.remainingPayment}</li>
          </ul>
          <p>Thank you for your business!</p>
        `,
            });
            console.log(`✓ Order confirmation email sent to ${customer.email}`);
        }
        catch (error) {
            console.error("✗ Error sending order confirmation email:", error);
            throw error;
        }
    }
    async sendOrderStatusUpdate(order, customer) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: customer.email,
                subject: `Order Status Update - ${order.orderNumber}`,
                html: `
          <h2>Order Status Update</h2>
          <p>Dear ${customer.name},</p>
          <p>Your order status has been updated.</p>
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Status:</strong> ${order.status.toUpperCase()}</li>
            <li><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</li>
          </ul>
          <p>Thank you for your patience!</p>
        `,
            });
            console.log(`✓ Order status update email sent to ${customer.email}`);
        }
        catch (error) {
            console.error("✗ Error sending order status update email:", error);
            throw error;
        }
    }
    async sendInvoice(invoice, customer, pdfBuffer) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: customer.email,
                subject: `Invoice ${invoice.invoiceNumber}`,
                html: `
          <h2>Invoice</h2>
          <p>Dear ${customer.name},</p>
          <p>Please find your invoice attached.</p>
          <h3>Invoice Details:</h3>
          <ul>
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
            <li><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</li>
            <li><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</li>
            <li><strong>Total Amount:</strong> $${invoice.total}</li>
          </ul>
          <p>Thank you for your business!</p>
        `,
            };
            if (pdfBuffer) {
                mailOptions.attachments = [
                    {
                        filename: `invoice-${invoice.invoiceNumber}.pdf`,
                        content: pdfBuffer,
                    },
                ];
            }
            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Invoice email sent to ${customer.email}`);
        }
        catch (error) {
            console.error("✗ Error sending invoice email:", error);
            throw error;
        }
    }
    async sendPaymentReceipt(order, customer, amount) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: customer.email,
                subject: `Payment Receipt - ${order.orderNumber}`,
                html: `
          <h2>Payment Receipt</h2>
          <p>Dear ${customer.name},</p>
          <p>We have received your payment.</p>
          <h3>Payment Details:</h3>
          <ul>
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Amount Paid:</strong> $${amount}</li>
            <li><strong>Remaining Balance:</strong> $${order.remainingPayment}</li>
            <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Thank you for your payment!</p>
        `,
            });
            console.log(`✓ Payment receipt email sent to ${customer.email}`);
        }
        catch (error) {
            console.error("✗ Error sending payment receipt email:", error);
            throw error;
        }
    }
    async sendCustomMessage(to, subject, message) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to,
                subject,
                html: message,
            });
            console.log(`✓ Custom message email sent to ${to}`);
        }
        catch (error) {
            console.error("✗ Error sending custom message email:", error);
            throw error;
        }
    }
}
exports.default = new EmailService();
//# sourceMappingURL=emailService.js.map