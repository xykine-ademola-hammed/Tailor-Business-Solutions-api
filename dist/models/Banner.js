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
exports.Banner = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const models_1 = require("../models");
let Banner = class Banner extends sequelize_typescript_1.Model {
};
exports.Banner = Banner;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Banner.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Banner.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Banner.prototype, "imageUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Banner.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        defaultValue: true,
    }),
    __metadata("design:type", String)
], Banner.prototype, "businessId", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => models_1.Document, {
        foreignKey: "entityId",
        scope: { entityType: "BANNER" }, // <- critical
        as: "documents",
        constraints: false, // <- no FK at DB level
    }),
    __metadata("design:type", Array)
], Banner.prototype, "documents", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Banner.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Banner.prototype, "updatedAt", void 0);
exports.Banner = Banner = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "business-banner",
        timestamps: true,
    })
], Banner);
//# sourceMappingURL=Banner.js.map