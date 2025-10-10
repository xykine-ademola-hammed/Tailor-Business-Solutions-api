"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("../models");
dotenv_1.default.config();
const sequelize = new sequelize_typescript_1.Sequelize({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    database: process.env.DB_NAME,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    dialect: process.env.NODE_ENV === "development" ? "mysql" : "mysql",
    storage: process.env.NODE_ENV === "development" ? ":memory:" : undefined,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    models: [
        models_1.User,
        models_1.Customer,
        models_1.Order,
        models_1.OrderItem,
        models_1.Product,
        models_1.Measurement,
        models_1.Invoice,
        models_1.Business,
        models_1.Document,
        models_1.Banner,
    ],
    // pool: {
    //   max: 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // }
});
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("✓ Database connection established successfully.");
        await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
        console.log("✓ Database synchronized.");
    }
    catch (error) {
        console.error("✗ Unable to connect to the database:", error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
exports.default = sequelize;
//# sourceMappingURL=database.js.map