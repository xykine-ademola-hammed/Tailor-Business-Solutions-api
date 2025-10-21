import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { OrderItem, Document } from "../models";

export enum ProductCategory {
  SHIRT = "shirt",
  PANT = "pant",
  SUIT = "suit",
  KURTA = "kurta",
  SHERWANI = "sherwani",
  OTHER = "other",
}

@Table({
  tableName: "products",
  timestamps: true,
})
export class Product extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  businessId!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {},
    get(this: Product) {
      const raw = this.getDataValue("options") as unknown;
      if (raw == null) return {};
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return {};
        }
      }
      return raw as Record<string, any>;
    },
    set(this: Product, value: unknown) {
      if (value == null) return this.setDataValue("options", {});
      if (typeof value === "string") {
        try {
          return this.setDataValue("options", JSON.parse(value));
        } catch {
          /* if not valid JSON, store as-is */
        }
      }
      this.setDataValue("options", value as Record<string, any>);
    },
  })
  declare options: Record<string, any>;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  lowPrice!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  highPrice!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @HasMany(() => Document, {
    foreignKey: "entityId",
    scope: { entityType: "PRODUCT" }, // <- critical
    as: "documents",
    constraints: false, // <- no FK at DB level
  })
  documents!: Document[];

  @HasMany(() => OrderItem)
  orderItems!: OrderItem[];
}
