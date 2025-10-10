"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { name, email, password, role, businessName } = req.body;
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }
        const user = await models_1.User.create({ name, email, password, role });
        const business = await models_1.Business.create({
            name: businessName,
            email,
            ownerId: user.id,
        });
        console.log("-------------------business-------", business);
        const token = (0, jwt_1.generateToken)(user.id);
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                businessId: business.id,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await models_1.User.findOne({ where: { email } });
        if (!user || !user.isActive) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, jwt_1.generateToken)(user.id);
        const business = await models_1.Business.findOne({ where: { ownerId: user.id } });
        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                businessId: business?.id,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map