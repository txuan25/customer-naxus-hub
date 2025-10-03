import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from '../../../database/entities/customer.entity';
import { Response } from '../../responses/entities/response.entity';

export enum InquiryStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

export enum InquiryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum InquiryCategory {
  GENERAL = 'general',
  TECHNICAL = 'technical',
  BILLING = 'billing',
  COMPLAINT = 'complaint',
  FEATURE_REQUEST = 'feature_request',
  SUPPORT = 'support',
}

@Entity('inquiries')
@Index(['status', 'priority'])
@Index(['customerId', 'status'])
@Index(['createdAt'])
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

  @Column({
    type: 'enum',
    enum: InquiryCategory,
    default: InquiryCategory.GENERAL,
  })
  category: InquiryCategory;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.inquiries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => Response, (response) => response.inquiry)
  responses: Response[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}