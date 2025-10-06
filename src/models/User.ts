import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff'
}

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.STAFF
  })
  role!: UserRole;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
