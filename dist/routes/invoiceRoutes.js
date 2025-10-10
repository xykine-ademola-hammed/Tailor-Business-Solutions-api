"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_1 = require("../controllers/invoiceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', invoiceController_1.getInvoices);
router.get('/:id', invoiceController_1.getInvoice);
router.post('/', invoiceController_1.createInvoice);
router.put('/:id', invoiceController_1.updateInvoice);
router.delete('/:id', invoiceController_1.deleteInvoice);
router.post('/:id/generate-pdf', invoiceController_1.generateInvoicePDF);
router.post('/:id/send-email', invoiceController_1.sendInvoiceEmail);
exports.default = router;
//# sourceMappingURL=invoiceRoutes.js.map