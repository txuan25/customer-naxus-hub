import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from '../../database/entities/response.entity';
import { ResponseStatus } from '../../common/enums/response-status.enum';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ApproveResponseDto, RejectResponseDto } from './dto/approve-response.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { InquiryStatus } from '../../common/enums/inquiry-status.enum';
import { InquiriesService } from '@modules/inquiries/inquiries.service';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    private inquiriesService: InquiriesService,
  ) {}

  async create(createResponseDto: CreateResponseDto, currentUser: any): Promise<Response> {
    // Verify inquiry exists
    const inquiry = await this.inquiriesService.findOne(createResponseDto.inquiryId);
    
    // Check if user is authorized (CSO assigned to inquiry or Manager/Admin)
    if (
      currentUser.role === UserRole.CSO &&
      inquiry.assignedTo !== currentUser.id
    ) {
      throw new ForbiddenException('You are not assigned to this inquiry');
    }

    const response = this.responseRepository.create({
      ...createResponseDto,
      responderId: currentUser.userId, // Sửa từ currentUser.id thành currentUser.userId
      status: createResponseDto.status || ResponseStatus.DRAFT,
      responseText: createResponseDto.responseText || '', // Provide default empty string
    });

    return this.responseRepository.save(response);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: {
      status?: ResponseStatus;
      inquiryId?: string;
      responderId?: string;
    },
  ) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    
    const query = this.responseRepository.createQueryBuilder('response');
    query.leftJoinAndSelect('response.inquiry', 'inquiry');
    query.leftJoinAndSelect('response.responder', 'responder');
    query.leftJoinAndSelect('inquiry.customer', 'customer');

    if (filters?.status) {
      query.andWhere('response.status = :status', { status: filters.status });
    }

    if (filters?.inquiryId) {
      query.andWhere('response.inquiryId = :inquiryId', { inquiryId: filters.inquiryId });
    }

    if (filters?.responderId) {
      query.andWhere('response.responderId = :responderId', { responderId: filters.responderId });
    }


    query.orderBy(`response.${sortBy}`, sortOrder as 'ASC' | 'DESC');
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

  async findOne(id: string): Promise<Response> {
    const response = await this.responseRepository.findOne({
      where: { id },
      relations: ['inquiry', 'inquiry.customer', 'responder'],
    });

    if (!response) {
      throw new NotFoundException(`Response with ID "${id}" not found`);
    }

    return response;
  }

  async update(
    id: string,
    updateResponseDto: UpdateResponseDto,
    currentUser: any,
  ): Promise<Response> {
    const response = await this.findOne(id);

    // Only allow update if response is in draft status
    if (response.status !== ResponseStatus.DRAFT) {
      throw new BadRequestException('Can only update responses in draft status');
    }

    // Check authorization
    if (
      response.responderId !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.MANAGER
    ) {
      throw new ForbiddenException('You do not have permission to update this response');
    }

    Object.assign(response, updateResponseDto);
    return this.responseRepository.save(response);
  }

  async submitForApproval(id: string, currentUser: any): Promise<Response> {
    const response = await this.findOne(id);

    // Check if response is in draft status
    if (response.status !== ResponseStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft responses for approval');
    }

    // Check authorization
    if (
      response.responderId !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to submit this response');
    }

    response.status = ResponseStatus.PENDING_APPROVAL;
    return this.responseRepository.save(response);
  }

  async approve(
    id: string,
    approveDto: ApproveResponseDto,
    currentUser: any,
  ): Promise<Response> {
    // Only managers and admins can approve
    if (currentUser.role !== UserRole.MANAGER && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only managers can approve responses');
    }

    const response = await this.findOne(id);

    // Check if response is pending approval
    if (response.status !== ResponseStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only approve responses that are pending approval');
    }

    response.status = ResponseStatus.APPROVED;
    response.approvedAt = new Date();
    response.approvalNotes = approveDto.approvalNotes || '';

    // Update inquiry status to responded
    await this.inquiriesService.updateStatus(response.inquiryId, InquiryStatus.RESPONDED);

    return this.responseRepository.save(response);
  }

  async reject(
    id: string,
    rejectDto: RejectResponseDto,
    currentUser: any,
  ): Promise<Response> {
    // Only managers and admins can reject
    if (currentUser.role !== UserRole.MANAGER && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only managers can reject responses');
    }

    const response = await this.findOne(id);

    // Check if response is pending approval
    if (response.status !== ResponseStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only reject responses that are pending approval');
    }

    response.status = ResponseStatus.REJECTED;
    response.rejectedAt = new Date();
    response.rejectionReason = rejectDto.rejectionReason;

    // Response goes back to draft for revision
    response.status = ResponseStatus.DRAFT;

    return this.responseRepository.save(response);
  }

  async sendResponse(id: string): Promise<Response> {
    const response = await this.findOne(id);

    // Check if response is approved
    if (response.status !== ResponseStatus.APPROVED) {
      throw new BadRequestException('Can only send approved responses');
    }

    response.status = ResponseStatus.SENT;
    response.sentAt = new Date();

    // Update inquiry status to closed
    await this.inquiriesService.updateStatus(response.inquiryId, InquiryStatus.CLOSED);

    // TODO: Implement actual sending mechanism (email, SMS, etc.)
    // For now, just update the status

    return this.responseRepository.save(response);
  }

  async getStatistics(userId?: string) {
    const query = this.responseRepository.createQueryBuilder('response');
    
    if (userId) {
      query.where('response.responderId = :userId', { userId });
    }

    const [
      totalCount,
      draftCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      sentCount,
    ] = await Promise.all([
      query.clone().getCount(),
      query.clone().andWhere('response.status = :status', { status: ResponseStatus.DRAFT }).getCount(),
      query.clone().andWhere('response.status = :status', { status: ResponseStatus.PENDING_APPROVAL }).getCount(),
      query.clone().andWhere('response.status = :status', { status: ResponseStatus.APPROVED }).getCount(),
      query.clone().andWhere('response.status = :status', { status: ResponseStatus.REJECTED }).getCount(),
      query.clone().andWhere('response.status = :status', { status: ResponseStatus.SENT }).getCount(),
    ]);

    return {
      total: totalCount,
      byStatus: {
        draft: draftCount,
        pendingApproval: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        sent: sentCount,
      },
      approvalRate: totalCount > 0 ? ((approvedCount + sentCount) / totalCount * 100).toFixed(2) : 0,
    };
  }

  async remove(id: string): Promise<void> {
    const response = await this.findOne(id);
    
    // Only allow deletion of draft responses
    if (response.status !== ResponseStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft responses');
    }

    await this.responseRepository.remove(response);
  }
}