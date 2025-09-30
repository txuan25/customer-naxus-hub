import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
import { Customer } from './customer.entity';
import { Response } from './response.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CSO,
  })
  role: UserRole;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'refresh_token', nullable: true })
  @Exclude()
  refreshToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Customer, (customer) => customer.createdBy)
  customersCreated: Customer[];

  @OneToMany(() => Customer, (customer) => customer.assignedTo)
  customersAssigned: Customer[];

  @OneToMany(() => Response, (response) => response.respondedBy)
  responses: Response[];

  @OneToMany(() => Response, (response) => response.approvedBy)
  approvedResponses: Response[];

  // Virtual properties
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Lifecycle hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Methods
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async hashRefreshToken(refreshToken: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.refreshToken = await bcrypt.hash(refreshToken, salt);
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    if (!this.refreshToken) return false;
    return bcrypt.compare(refreshToken, this.refreshToken);
  }
}