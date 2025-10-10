import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import { Document } from "../models";

@Table({
  tableName: "business-banner",
  timestamps: true,
})
export class Banner extends Model {
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
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: true,
  })
  businessId!: string;

  @HasMany(() => Document, {
    foreignKey: "entityId",
    scope: { entityType: "BANNER" }, // <- critical
    as: "documents",
    constraints: false, // <- no FK at DB level
  })
  documents!: Document[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
