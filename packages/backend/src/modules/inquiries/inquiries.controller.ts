import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginationDto } from '@common/dto/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { InquiryStatus, InquiryPriority } from '../../common/enums/inquiry-status.enum';
import { InquiryCategory } from '../../database/entities/inquiry.entity';

@ApiTags('inquiries')
@ApiBearerAuth()
@Controller('inquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inquiry' })
  @ApiResponse({ status: 201, description: 'Inquiry created successfully' })
  create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inquiries with pagination' })
  @ApiQuery({ name: 'status', required: false, enum: InquiryStatus })
  @ApiQuery({ name: 'priority', required: false, enum: InquiryPriority })
  @ApiQuery({ name: 'category', required: false, enum: InquiryCategory })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: InquiryStatus | InquiryStatus[],
    @Query('priority') priority?: InquiryPriority,
    @Query('category') category?: InquiryCategory,
    @Query('customerId') customerId?: string,
    @Query('assignedTo') assignedTo?: string,
    @CurrentUser() user?: any,
  ) {
    // Handle multiple status values from query params like ?status=pending&status=in_progress
    let processedStatus = status;
    if (typeof status === 'string' && status.includes(',')) {
      // Handle comma-separated values like ?status=pending,in_progress
      processedStatus = status.split(',').map(s => s.trim()) as InquiryStatus[];
    }

    const filters = {
      status: processedStatus,
      priority,
      category,
      customerId,
      assignedTo,
      assignedToMe: paginationDto.assignedToMe,
    };

    // Remove undefined values from filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    return this.inquiriesService.findAll(
      paginationDto,
      Object.keys(filters).length > 0 ? filters : undefined,
      user
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get inquiry statistics' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.inquiriesService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inquiry' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInquiryDto: UpdateInquiryDto,
    @CurrentUser() user: any,
  ) {
    return this.inquiriesService.update(id, updateInquiryDto, user);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign inquiry to a CSO' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('csoId', ParseUUIDPipe) csoId: string,
  ) {
    return this.inquiriesService.assignToCSO(id, csoId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update inquiry status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: InquiryStatus,
  ) {
    return this.inquiriesService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inquiry' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inquiriesService.remove(id);
  }
}