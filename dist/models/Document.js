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
exports.Document = void 0;
// models/Document.ts
const sequelize_typescript_1 = require("sequelize-typescript");
let Document = class Document extends sequelize_typescript_1.Model {
};
exports.Document = Document;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Document.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)("idx_documents_entity"),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM("PRODUCT", "ORDER", "BUSINESS", "USER", "BANNER"),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Document.prototype, "entityType", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)("idx_documents_entity"),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID, // must match your target PK type/format
        allowNull: false,
    }),
    __metadata("design:type", String)
], Document.prototype, "entityId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Document.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Document.prototype, "fileName", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Document.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Document.prototype, "updatedAt", void 0);
exports.Document = Document = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "documents", timestamps: true })
], Document);
//# sourceMappingURL=Document.js.map