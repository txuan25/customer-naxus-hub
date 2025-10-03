import { PartialType } from '@nestjs/swagger';
import { CreateInquiryDto } from './create-inquiry.dto';
import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus, InquiryPriority } from '../../../common/enums/inquiry-status.enum';
import { InquiryCategory } from '../../../database/entities/inquiry.entity';

export class UpdateInquiryDto extends PartialType(CreateInquiryDto) {
  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsEnum(InquiryStatus)
  @IsOptional()
  status?: InquiryStatus;

  @ApiPropertyOptional({ description: 'ID of assigned CSO' })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ enum: InquiryPriority })
  @IsEnum(InquiryPriority)
  @IsOptional()
  priority?: InquiryPriority;

  @ApiPropertyOptional({ enum: InquiryCategory })
  @IsEnum(InquiryCategory)
  @IsOptional()
  category?: InquiryCategory;
}