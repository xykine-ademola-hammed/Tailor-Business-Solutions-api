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
  })
  measurements!: Record<string, number>;

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
