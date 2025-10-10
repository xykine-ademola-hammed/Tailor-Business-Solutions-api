// models/Document.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  Index,
} from "sequelize-typescript";

export type PolymorphicOwner =
  | "PRODUCT"
  | "ORDER"
  | "BUSINESS"
  | "USER"
  | "BANNER"; // extend as needed

@Table({ tableName: "documents", timestamps: true })
export class Document extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  // Which table/model does entityId belong to?
  @Index("idx_documents_entity")
  @Column({
    type: DataType.ENUM("PRODUCT", "ORDER", "BUSINESS", "USER", "BANNER"),
    allowNull: false,
  })
  entityType!: PolymorphicOwner;

  // The primary key value in that table
  @Index("idx_documents_entity")
  @Column({
    type: DataType.UUID, // must match your target PK type/format
    allowNull: false,
  })
  entityId!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  url!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  mimeType!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  fileName!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
