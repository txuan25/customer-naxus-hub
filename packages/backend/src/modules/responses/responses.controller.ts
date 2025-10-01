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
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ApproveResponseDto, RejectResponseDto } from './dto/approve-response.dto';
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
import { UserRole } from '@entities/user.entity';
import { ResponseStatus } from './entities/response.entity';

@ApiTags('responses')
@ApiBearerAuth()
@Controller('responses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new response (draft)' })
  @ApiResponse({ status: 201, description: 'Response created successfully' })
  @Roles(UserRole.CSO, UserRole.MANAGER, UserRole.ADMIN)
  create(
    @Body() createResponseDto: CreateResponseDto,
    @CurrentUser() user: any,
  ) {
    return this.responsesService.create(createResponseDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all responses with pagination' })
  @ApiQuery({ name: 'status', required: false, enum: ResponseStatus })
  @ApiQuery({ name: 'inquiryId', required: false })
  @ApiQuery({ name: 'responderId', required: false })
  @ApiQuery({ name: 'approvedById', required: false })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: ResponseStatus,
    @Query('inquiryId') inquiryId?: string,
    @Query('responderId') responderId?: string,
    @Query('approvedById') approvedById?: string,
  ) {
    return this.responsesService.findAll(paginationDto, {
      status,
      inquiryId,
      responderId,
      approvedById,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get response statistics' })
  @ApiQuery({ name: 'userId', required: false })
  getStatistics(@Query('userId') userId?: string) {
    return this.responsesService.getStatistics(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get response by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft response' })
  @Roles(UserRole.CSO, UserRole.MANAGER, UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateResponseDto: UpdateResponseDto,
    @CurrentUser() user: any,
  ) {
    return this.responsesService.update(id, updateResponseDto, user);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit response for approval' })
  @Roles(UserRole.CSO, UserRole.ADMIN)
  submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.responsesService.submitForApproval(id, user);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a response (Manager only)' })
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveResponseDto,
    @CurrentUser() user: any,
  ) {
    return this.responsesService.approve(id, approveDto, user);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a response (Manager only)' })
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectResponseDto,
    @CurrentUser() user: any,
  ) {
    return this.responsesService.reject(id, rejectDto, user);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send approved response to customer' })
  @Roles(UserRole.ADMIN)
  sendResponse(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsesService.sendResponse(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft response' })
  @Roles(UserRole.CSO, UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsesService.remove(id);
  }
}