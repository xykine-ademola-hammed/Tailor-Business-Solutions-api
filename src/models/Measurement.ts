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
import { Customer } from "./Customer";
import { ProductCategory } from "./Product";

@Table({
  tableName: "measurements",
  timestamps: true,
})
export class Measurement extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  customerId!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {},
    get(this: Measurement) {
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
    set(this: Measurement, value: unknown) {
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

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Customer)
  customer!: Customer;
}
