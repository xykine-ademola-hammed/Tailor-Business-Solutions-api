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
exports.OrderItem = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Order_1 = require("./Order");
const Product_1 = require("./Product");
let OrderItem = class OrderItem extends sequelize_typescript_1.Model {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true
    }),
    __metadata("design:type", String)
], OrderItem.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Order_1.Order),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false
    }),
    __metadata("design:type", String)
], OrderItem.prototype, "orderId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Product_1.Product),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false
    }),
    __metadata("design:type", String)
], OrderItem.prototype, "productId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], OrderItem.prototype, "productName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false
    }),
    __metadata("design:type", Number)
], OrderItem.prototype, "unitPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false
    }),
    __metadata("design:type", Number)
], OrderItem.prototype, "totalPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true
    }),
    __metadata("design:type", String)
], OrderItem.prototype, "specifications", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], OrderItem.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], OrderItem.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Order_1.Order),
    __metadata("design:type", Order_1.Order)
], OrderItem.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Product_1.Product),
    __metadata("design:type", Product_1.Product)
], OrderItem.prototype, "product", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'order_items',
        timestamps: true
    })
], OrderItem);
//# sourceMappingURL=OrderItem.js.map