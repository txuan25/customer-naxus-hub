import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { User } from '../../../entities/user.entity';

export enum ResponseStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SENT = 'sent',
}

@Entity('responses')
@Index(['status'])
@Index(['inquiryId', 'status'])
@Index(['responderId'])
@Index(['approvedById'])
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

  @Column({ name: 'inquiry_id' })
  inquiryId: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: Inquiry;

  @Column({ name: 'responder_id' })
  responderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responder_id' })
  responder: User;

  @Column({ name: 'approved_by_id', nullable: true })
  approvedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}