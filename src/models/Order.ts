import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { Customer } from "./Customer";
import { OrderItem } from "./OrderItem";
import { Invoice } from "./Invoice";

export enum OrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

@Table({
  tableName: "orders",
  timestamps: true,
})
export class Order extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  orderNumber!: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  customerId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    defaultValue: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  orderDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  deliveryDate!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalAmount!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  advancePayment!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  remainingPayment!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentStatus?: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  vatOrTax?: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  shippingCost?: number;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  businessId!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {},
    get(this: Order) {
      const raw = this.getDataValue("measurements") as unknown;
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
    set(this: Order, value: unknown) {
      if (value == null) return this.setDataValue("measurements", {});
      if (typeof value === "string") {
        try {
          return this.setDataValue("measurements", JSON.parse(value));
        } catch {
          /* if not valid JSON, store as-is */
        }
      }
      this.setDataValue("measurements", value as Record<string, any>);
    },
  })
  declare measurements: Record<string, any>;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Customer)
  customer!: Customer;

  @HasMany(() => OrderItem)
  items!: OrderItem[];

  @HasMany(() => Invoice)
  invoices!: Invoice[];
}
