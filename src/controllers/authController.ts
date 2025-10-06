import { Request, Response } from "express";
import { Business, User } from "../models";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, businessName } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const user = await User.create({ name, email, password, role });
    const business = await Business.create({
      name: businessName,
      email,
      ownerId: user.id,
    });

    console.log("-------------------business-------", business);

    const token = generateToken(user.id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
