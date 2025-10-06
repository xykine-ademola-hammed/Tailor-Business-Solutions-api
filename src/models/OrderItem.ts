import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Order } from './Order';
import { Product } from './Product';

@Table({
  tableName: 'order_items',
  timestamps: true
})
export class OrderItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  orderId!: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  productId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  productName!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  unitPrice!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  totalPrice!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  specifications?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Order)
  order!: Order;

  @BelongsTo(() => Product)
  product!: Product;
}
