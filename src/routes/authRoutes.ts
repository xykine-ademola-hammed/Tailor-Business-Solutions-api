import { Router } from "express";
import {
  register,
  login,
  verifyCurrentToken,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-token", verifyCurrentToken);

export default router;
