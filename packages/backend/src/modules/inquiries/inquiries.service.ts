import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryCategory } from '../../database/entities/inquiry.entity';
import { InquiryStatus, InquiryPriority } from '../../common/enums/inquiry-status.enum';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async create(createInquiryDto: CreateInquiryDto): Promise<Inquiry> {
    const inquiry = this.inquiryRepository.create(createInquiryDto);
    return this.inquiryRepository.save(inquiry);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: {
      status?: InquiryStatus;
      priority?: InquiryPriority;
      category?: InquiryCategory;
      customerId?: string;
      assignedTo?: string;
    },
    currentUser?: { userId: string; role: UserRole },
  ) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'DESC' } = paginationDto;
    
    console.log('DEBUG: Service findAll - currentUser:', {
      currentUser,
      currentUserKeys: currentUser ? Object.keys(currentUser) : null,
      sortBy,
      sortOrder,
    });
    
    const query = this.inquiryRepository.createQueryBuilder('inquiry');
    query.leftJoinAndSelect('inquiry.customer', 'customer');
    query.leftJoinAndSelect('inquiry.responses', 'responses');

    // Filter inquiries for CSO role - only show assigned inquiries
    if (currentUser && currentUser.role === UserRole.CSO) {
      query.andWhere('inquiry.assignedTo = :userId', { userId: currentUser.userId });
    }

    if (filters?.status) {
      query.andWhere('inquiry.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      query.andWhere('inquiry.priority = :priority', { priority: filters.priority });
    }

    if (filters?.category) {
      query.andWhere('inquiry.category = :category', { category: filters.category });
    }

    if (filters?.customerId) {
      query.andWhere('inquiry.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.assignedTo) {
      query.andWhere('inquiry.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
    }

    // Apply sorting logic
    if (sortBy) {
      // Manual sorting - user clicked a column header
      query.orderBy(`inquiry.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    } else {
      // Smart sorting - default behavior when no manual sort is applied
      this.applySmartSorting(query, currentUser);
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private applySmartSorting(query: any, currentUser?: { userId: string; role: UserRole }) {
    if (!currentUser) {
      // Fallback: just sort by creation date if no user context
      query.orderBy('inquiry.createdAt', 'DESC');
      return;
    }

    // Add computed column for response priority based on user role
    let responsePriorityCase = '';
    if (currentUser.role === UserRole.CSO) {
      // CSO can respond to PENDING and IN_PROGRESS
      responsePriorityCase = `
        CASE
          WHEN inquiry.status IN ('pending', 'in_progress') THEN 1
          ELSE 0
        END
      `;
    } else if (currentUser.role === UserRole.MANAGER) {
      // Manager can respond to all statuses
      responsePriorityCase = '1';
    } else {
      // Other roles (ADMIN) - no response capability
      responsePriorityCase = '0';
    }

    // Add computed column for priority ordering (URGENT=3, HIGH=2, MEDIUM=1, LOW=0)
    const priorityCase = `
      CASE inquiry.priority
        WHEN 'urgent' THEN 3
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 1
        WHEN 'low' THEN 0
        ELSE 0
      END
    `;

    query.addSelect(`(${responsePriorityCase})`, 'response_priority');
    query.addSelect(`(${priorityCase})`, 'priority_order');

    // Apply smart sorting: response priority first, then priority level, then creation date
    query.orderBy('response_priority', 'DESC');
    query.addOrderBy('priority_order', 'DESC');
    query.addOrderBy('inquiry.createdAt', 'DESC');
  }

  async findOne(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['customer', 'responses', 'responses.responder'],
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID "${id}" not found`);
    }

    return inquiry;
  }

  async update(
    id: string,
    updateInquiryDto: UpdateInquiryDto,
    currentUser: any,
  ): Promise<Inquiry> {
    const inquiry = await this.findOne(id);

    // Only admins, managers, or assigned CSOs can update
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.MANAGER &&
      (currentUser.role === UserRole.CSO && inquiry.assignedTo !== currentUser.userId)  // Fix: use userId instead of id
    ) {
      throw new ForbiddenException('You do not have permission to update this inquiry');
    }

    Object.assign(inquiry, updateInquiryDto);

    // No need to track resolved date as it's not in the database schema

    return this.inquiryRepository.save(inquiry);
  }

  async assignToCSO(id: string, csoId: string): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    inquiry.assignedTo = csoId;
    inquiry.status = InquiryStatus.IN_PROGRESS;
    return this.inquiryRepository.save(inquiry);
  }

  async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    inquiry.status = status;

    // Status updated - no additional tracking needed

    return this.inquiryRepository.save(inquiry);
  }

  async getStatistics() {
    const [
      totalCount,
      pendingCount,
      inProgressCount,
      respondedCount,
      closedCount,
      urgentCount,
      averageResponseTime,
    ] = await Promise.all([
      this.inquiryRepository.count(),
      this.inquiryRepository.count({ where: { status: InquiryStatus.PENDING } }),
      this.inquiryRepository.count({ where: { status: InquiryStatus.IN_PROGRESS } }),
      this.inquiryRepository.count({ where: { status: InquiryStatus.RESPONDED } }),
      this.inquiryRepository.count({ where: { status: InquiryStatus.CLOSED } }),
      this.inquiryRepository.count({ where: { priority: InquiryPriority.URGENT } }),
      this.getAverageResponseTime(),
    ]);

    return {
      total: totalCount,
      byStatus: {
        pending: pendingCount,
        inProgress: inProgressCount,
        responded: respondedCount,
        closed: closedCount,
      },
      urgent: urgentCount,
      averageResponseTime,
    };
  }

  private async getAverageResponseTime(): Promise<number> {
    // Calculate based on status change timestamps if needed
    // For now, return 0 as we don't have resolved_at tracking
    return 0;
  }

  async remove(id: string): Promise<void> {
    const inquiry = await this.findOne(id);
    await this.inquiryRepository.remove(inquiry);
  }
}