import { Router } from "express";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getMyCustomers,
} from "../controllers/customerController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getCustomers);
router.get("/my", getMyCustomers);
router.get("/stats", getCustomerStats);
router.get("/:id", getCustomer);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
