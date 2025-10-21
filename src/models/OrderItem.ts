import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { Order } from "./Order";
import { Product } from "./Product";

@Table({
  tableName: "order_items",
  timestamps: true,
})
export class OrderItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  orderId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  businessId!: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  productName!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice!: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {},
    get(this: OrderItem) {
      const raw = this.getDataValue("specifications") as unknown;
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
    set(this: OrderItem, value: unknown) {
      if (value == null) return this.setDataValue("specifications", {});
      if (typeof value === "string") {
        try {
          return this.setDataValue("specifications", JSON.parse(value));
        } catch {
          /* if not valid JSON, store as-is */
        }
      }
      this.setDataValue("specifications", value as Record<string, any>);
    },
  })
  declare specifications: Record<string, any>;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Order)
  order!: Order;

  @BelongsTo(() => Product)
  product!: Product;
}
