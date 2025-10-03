import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CustomerStatus } from '../../common/enums/customer-status.enum';
import { Inquiry } from './inquiry.entity';

@Entity('customers')
@Index(['email'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;

  @Column({
    name: 'segment',
    type: 'enum',
    enum: ['premium', 'standard', 'basic', 'vip'],
    default: 'standard'
  })
  segment: string;

  @Column({
    name: 'total_spent',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0
  })
  totalSpent: number;

  @Column({ name: 'order_count', type: 'int', default: 0 })
  orderCount: number;

  @Column({ name: 'last_order_date', nullable: true })
  lastOrderDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Inquiry, (inquiry) => inquiry.customer)
  inquiries: Inquiry[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === 'active';
  }
}