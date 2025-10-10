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
exports.Order = exports.OrderStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Customer_1 = require("./Customer");
const OrderItem_1 = require("./OrderItem");
const Invoice_1 = require("./Invoice");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["IN_PROGRESS"] = "in_progress";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let Order = class Order extends sequelize_typescript_1.Model {
};
exports.Order = Order;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true
    }),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        unique: true
    }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Customer_1.Customer),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false
    }),
    __metadata("design:type", String)
], Order.prototype, "customerId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(OrderStatus)),
        defaultValue: OrderStatus.PENDING
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false
    }),
    __metadata("design:type", Date)
], Order.prototype, "orderDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false
    }),
    __metadata("design:type", Date)
], Order.prototype, "deliveryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false
    }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        defaultValue: 0
    }),
    __metadata("design:type", Number)
], Order.prototype, "advancePayment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        defaultValue: 0
    }),
    __metadata("design:type", Number)
], Order.prototype, "remainingPayment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true
    }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Customer_1.Customer),
    __metadata("design:type", Customer_1.Customer)
], Order.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => OrderItem_1.OrderItem),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Invoice_1.Invoice),
    __metadata("design:type", Array)
], Order.prototype, "invoices", void 0);
exports.Order = Order = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'orders',
        timestamps: true
    })
], Order);
//# sourceMappingURL=Order.js.map