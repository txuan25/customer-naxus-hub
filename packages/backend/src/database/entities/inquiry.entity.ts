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
    default: InquiryStatus.OPEN,
  })
  status: InquiryStatus;

  @Column({
    type: 'enum',
    enum: InquiryPriority,
    default: InquiryPriority.MEDIUM,
  })
  priority: InquiryPriority;

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;

  @Column({ nullable: true })
  tags?: string;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt?: Date;

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
  get isOpen(): boolean {
    return this.status === InquiryStatus.OPEN;
  }

  get isPending(): boolean {
    return this.status === InquiryStatus.PENDING_APPROVAL;
  }

  get isResolved(): boolean {
    return [InquiryStatus.APPROVED, InquiryStatus.CLOSED].includes(this.status);
  }

  get isHighPriority(): boolean {
    return [InquiryPriority.HIGH, InquiryPriority.URGENT].includes(this.priority);
  }

  // Methods
  markAsInProgress(): void {
    this.status = InquiryStatus.IN_PROGRESS;
  }

  markAsResolved(notes?: string): void {
    this.status = InquiryStatus.CLOSED;
    this.resolvedAt = new Date();
    if (notes) {
      this.resolutionNotes = notes;
    }
  }
}