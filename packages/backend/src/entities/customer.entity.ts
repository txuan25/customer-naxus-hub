import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Inquiry } from '../modules/inquiries/entities/inquiry.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum CustomerSegment {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  BASIC = 'basic',
  VIP = 'vip',
}

@Entity('customers')
@Index(['email'], { unique: true })
@Index(['status'])
@Index(['segment'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({
    type: 'enum',
    enum: CustomerSegment,
    default: CustomerSegment.STANDARD,
  })
  segment: CustomerSegment;

  @Column({ name: 'total_spent', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ name: 'order_count', default: 0 })
  orderCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Inquiry, (inquiry) => inquiry.customer)
  inquiries: Inquiry[];
}