import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { OrderItem } from "./OrderItem";
import { ProductDocument } from "./ProductDocument";

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
    type: DataType.STRING,
    allowNull: true,
  })
  unit!: string;

  @Column({
    type: DataType.JSON,
    defaultValue: {},
  })
  options!: Record<string, any>;

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

  @HasMany(() => ProductDocument)
  documents!: ProductDocument[];

  @HasMany(() => OrderItem)
  orderItems!: OrderItem[];
}
