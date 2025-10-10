"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = exports.ProductCategory = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const models_1 = require("../models");
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["SHIRT"] = "shirt";
    ProductCategory["PANT"] = "pant";
    ProductCategory["SUIT"] = "suit";
    ProductCategory["KURTA"] = "kurta";
    ProductCategory["SHERWANI"] = "sherwani";
    ProductCategory["OTHER"] = "other";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
let Product = class Product extends sequelize_typescript_1.Model {
};
exports.Product = Product;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Product.prototype, "businessId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
        defaultValue: {},
    }),
    __metadata("design:type", Object)
], Product.prototype, "options", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Product.prototype, "lowPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Product.prototype, "highPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Product.prototype, "imageUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
    }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => models_1.Document, {
        foreignKey: "entityId",
        scope: { entityType: "PRODUCT" }, // <- critical
        as: "documents",
        constraints: false, // <- no FK at DB level
    }),
    __metadata("design:type", Array)
], Product.prototype, "documents", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => models_1.OrderItem),
    __metadata("design:type", Array)
], Product.prototype, "orderItems", void 0);
exports.Product = Product = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "products",
        timestamps: true,
    })
], Product);
//# sourceMappingURL=Product.js.map