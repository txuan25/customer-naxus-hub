import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { InquiryStatus, InquiryPriority } from '../../common/enums/inquiry-status.enum';
import { Customer } from './customer.entity';
import { Response } from './response.entity';
import { User } from './user.entity';

export enum InquiryCategory {
  GENERAL = 'general',
  TECHNICAL = 'technical',
  BILLING = 'billing',
  COMPLAINT = 'complaint',
  FEATURE_REQUEST = 'feature_request',
  SUPPORT = 'support',
}

@Entity('inquiries')
@Index(['customerId', 'status'])
@Index(['status', 'priority'])
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
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


  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;


  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Customer, (customer) => customer.inquiries)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  customerId: string;

  @OneToMany(() => Response, (response) => response.inquiry)
  responses: Response[];

  // Virtual properties
  get isPending(): boolean {
    return this.status === InquiryStatus.PENDING;
  }

  get isInProgress(): boolean {
    return this.status === InquiryStatus.IN_PROGRESS;
  }

  get isResolved(): boolean {
    return [InquiryStatus.RESPONDED, InquiryStatus.CLOSED].includes(this.status);
  }

  get isHighPriority(): boolean {
    return [InquiryPriority.HIGH, InquiryPriority.URGENT].includes(this.priority);
  }

  // Methods
  markAsInProgress(): void {
    this.status = InquiryStatus.IN_PROGRESS;
  }

  markAsResolved(): void {
    this.status = InquiryStatus.CLOSED;
  }
}