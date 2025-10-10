"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const models_1 = require("../models");
class PDFService {
    async generateInvoicePDF(invoice) {
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            const order = await models_1.Order.findByPk(invoice.orderId, {
                include: [
                    { model: models_1.OrderItem, as: "items" },
                    { model: models_1.Customer, as: "customer" },
                ],
            });
            const customer = await models_1.Customer.findByPk(invoice.customerId);
            if (!order || !customer) {
                throw new Error("Order or customer not found");
            }
            const html = this.generateInvoiceHTML(invoice, order, customer);
            await page.setContent(html, { waitUntil: "networkidle0" });
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20px",
                    right: "20px",
                    bottom: "20px",
                    left: "20px",
                },
            });
            return Buffer.from(pdfBuffer);
        }
        finally {
            await browser.close();
        }
    }
    generateInvoiceHTML(invoice, order, customer) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .invoice-title {
            font-size: 24px;
            color: #666;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-block {
            width: 48%;
          }
          .info-block h3 {
            margin-bottom: 10px;
            color: #333;
          }
          .info-block p {
            margin: 5px 0;
            line-height: 1.6;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #333;
            color: white;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .totals {
            float: right;
            width: 300px;
          }
          .totals table {
            margin-bottom: 0;
          }
          .totals td {
            border: none;
          }
          .total-row {
            font-weight: bold;
            font-size: 18px;
            background-color: #f5f5f5;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Tailor Management System</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="info-section">
          <div class="info-block">
            <h3>Bill To:</h3>
            <p><strong>${customer.name}</strong></p>
            <p>${customer.email}</p>
            <p>${customer.phone}</p>
            ${customer.address ? `<p>${customer.address}</p>` : ""}
            ${customer.city ? `<p>${customer.city}</p>` : ""}
          </div>
          <div class="info-block" style="text-align: right;">
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
            ?.map((item) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>$${Number(item.unitPrice).toFixed(2)}</td>
                <td>$${Number(item.totalPrice).toFixed(2)}</td>
              </tr>
            `)
            .join("") || ""}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">$${Number(invoice.subtotal).toFixed(2)}</td>
            </tr>
            ${invoice.discount > 0
            ? `
            <tr>
              <td>Discount:</td>
              <td style="text-align: right;">-$${Number(invoice.discount).toFixed(2)}</td>
            </tr>
            `
            : ""}
            ${invoice.tax > 0
            ? `
            <tr>
              <td>Tax:</td>
              <td style="text-align: right;">$${Number(invoice.tax).toFixed(2)}</td>
            </tr>
            `
            : ""}
            <tr class="total-row">
              <td>Total:</td>
              <td style="text-align: right;">$${Number(invoice.total).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="clear: both;"></div>

        ${invoice.notes
            ? `
        <div style="margin-top: 30px;">
          <h3>Notes:</h3>
          <p>${invoice.notes}</p>
        </div>
        `
            : ""}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice.</p>
        </div>
      </body>
      </html>
    `;
    }
}
exports.default = new PDFService();
//# sourceMappingURL=pdfService.js.map