import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import orderRoutes from "./routes/orderRoutes";
import measurementRoutes from "./routes/measurementRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import productRoutes from "./routes/productRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import bannerRoutes from "./routes/bannerRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Tailor Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/banners", bannerRoutes);
// app.use('/api/businessBanner', businessBannerRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 Tailor Management System API Server                    ║
║                                                              ║
║   ✓ Server running on port ${PORT}                           ║
║   ✓ Database connected                                      ║
║   ✓ API URL: http://localhost:${PORT}/api                    ║
║   ✓ Health Check: http://localhost:${PORT}/health            ║
║                                                              ║
║   Environment: ${
        process.env.NODE_ENV || "development"
      }                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
