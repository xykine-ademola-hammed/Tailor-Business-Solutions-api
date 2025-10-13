import { Router } from "express";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePDF,
  sendInvoiceEmail,
  getBusinessInvoices,
} from "../controllers/invoiceController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getInvoices);
router.get("/business", getBusinessInvoices);
router.get("/:id", getInvoice);
router.post("/", createInvoice);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);
router.post("/:id/generate-pdf", generateInvoicePDF);
router.post("/:id/send-email", sendInvoiceEmail);

export default router;
