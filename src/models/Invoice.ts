import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Order } from './Order';
import { Customer } from './Customer';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

@Table({
  tableName: 'invoices',
  timestamps: true
})
export class Invoice extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  invoiceNumber!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  orderId!: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  customerId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  invoiceDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  dueDate!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  subtotal!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  tax!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  discount!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  total!: number;

  @Column({
    type: DataType.ENUM(...Object.values(InvoiceStatus)),
    defaultValue: InvoiceStatus.DRAFT
  })
  status!: InvoiceStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  pdfUrl?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  notes?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Order)
  order!: Order;

  @BelongsTo(() => Customer)
  customer!: Customer;
}
