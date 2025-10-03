import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ResponseStatus } from '../../common/enums/response-status.enum';
import { User } from './user.entity';
import { Inquiry } from './inquiry.entity';

@Entity('responses')
@Index(['inquiryId', 'status'])
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'response_text', type: 'text' })
  responseText: string;


  @Column({
    type: 'enum',
    enum: ResponseStatus,
    default: ResponseStatus.DRAFT,
  })
  status: ResponseStatus;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes?: string;

  @Column({ name: 'sent_at', nullable: true })
  sentAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;




  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Inquiry, (inquiry) => inquiry.responses)
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: Inquiry;

  @Column({ name: 'inquiry_id' })
  inquiryId: string;

  @ManyToOne(() => User, (user) => user.responses)
  @JoinColumn({ name: 'responder_id' })
  responder: User;

  @Column({ name: 'responder_id' })
  responderId: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Virtual properties
  get isDraft(): boolean {
    return this.status === ResponseStatus.DRAFT;
  }

  get isPendingApproval(): boolean {
    return this.status === ResponseStatus.PENDING_APPROVAL;
  }

  get isApproved(): boolean {
    return this.status === ResponseStatus.APPROVED;
  }

  get isRejected(): boolean {
    return this.status === ResponseStatus.REJECTED;
  }

  get isSent(): boolean {
    return this.status === ResponseStatus.SENT;
  }

  // Methods
  submitForApproval(): void {
    if (this.status !== ResponseStatus.DRAFT) {
      throw new Error('Only draft responses can be submitted for approval');
    }
    this.status = ResponseStatus.PENDING_APPROVAL;
  }

  approve(userId: string, notes?: string): void {
    if (this.status !== ResponseStatus.PENDING_APPROVAL) {
      throw new Error('Only pending responses can be approved');
    }
    this.status = ResponseStatus.APPROVED;
    this.approvedAt = new Date();
    if (notes) {
      this.approvalNotes = notes;
    }
  }

  reject(userId: string, reason: string): void {
    if (this.status !== ResponseStatus.PENDING_APPROVAL) {
      throw new Error('Only pending responses can be rejected');
    }
    this.status = ResponseStatus.REJECTED;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
  }

  markAsSent(): void {
    if (this.status !== ResponseStatus.APPROVED) {
      throw new Error('Only approved responses can be marked as sent');
    }
    this.status = ResponseStatus.SENT;
    this.sentAt = new Date();
  }
}