import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import path from "path";
import {
  Customer,
  Invoice,
  Measurement,
  Order,
  OrderItem,
  Product,
  User,
  Business,
  Banner,
  Document,
} from "../models";

dotenv.config();

const sequelize = new Sequelize({
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
    User,
    Customer,
    Order,
    OrderItem,
    Product,
    Measurement,
    Invoice,
    Business,
    Document,
    Banner,
  ],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established successfully.");

    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("✓ Database synchronized.");
  } catch (error) {
    console.error("✗ Unable to connect to the database:", error);
    process.exit(1);
  }
};

export default sequelize;
