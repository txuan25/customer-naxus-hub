import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from './user.entity';

export enum InquiryStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum InquiryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.PENDING,
  })
  status: InquiryStatus;

  @Column({
    type: 'enum',
    enum: InquiryPriority,
    default: InquiryPriority.MEDIUM,
  })
  priority: InquiryPriority;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}