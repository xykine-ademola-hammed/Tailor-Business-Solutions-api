"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const measurementRoutes_1 = __importDefault(require("./routes/measurementRoutes"));
const invoiceRoutes_1 = __importDefault(require("./routes/invoiceRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const bannerRoutes_1 = __importDefault(require("./routes/bannerRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Tailor Management API is running" });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/customers", customerRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/measurements", measurementRoutes_1.default);
app.use("/api/invoices", invoiceRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/banners", bannerRoutes_1.default);
// app.use('/api/businessBanner', businessBannerRoutes);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
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
║   Environment: ${process.env.NODE_ENV || "development"}                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map