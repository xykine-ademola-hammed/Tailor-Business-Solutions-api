import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import bcrypt from "bcryptjs";

@Table({
  tableName: "business-banner",
  timestamps: true,
})
export class BusinessBanner extends Model {
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
  imageUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: true,
  })
  businessId!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
