"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database")); // Assuming you have a sequelize instance
const syncDatabase = async () => {
    try {
        // Authenticate the connection
        await database_1.default.authenticate();
        console.log("Database connection established successfully.");
        // Synchronize models
        await database_1.default.sync({ force: false, alter: true }); // Use force: true for development, alter: true or migrations for production
        console.log("All models synchronized successfully.");
    }
    catch (error) {
        console.error("Error synchronizing database:", error);
    }
    finally {
        await database_1.default.close(); // Close the connection after synchronization
        console.log("Database connection closed.");
    }
};
syncDatabase();
//# sourceMappingURL=sync.js.map