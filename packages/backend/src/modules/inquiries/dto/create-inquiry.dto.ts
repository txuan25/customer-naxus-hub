import { IsString, IsEnum, IsUUID, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryPriority, InquiryCategory } from '../entities/inquiry.entity';

export class CreateInquiryDto {
  @ApiProperty({ description: 'Subject of the inquiry' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Detailed message or description' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Customer ID who created the inquiry' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ enum: InquiryPriority, default: InquiryPriority.MEDIUM })
  @IsEnum(InquiryPriority)
  @IsOptional()
  priority?: InquiryPriority;

  @ApiPropertyOptional({ enum: InquiryCategory, default: InquiryCategory.GENERAL })
  @IsEnum(InquiryCategory)
  @IsOptional()
  category?: InquiryCategory;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}