import { IsOptional, IsPositive, IsString, Min, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { InquiryStatus } from '../enums/inquiry-status.enum';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Filter to show only assigned items (for CSO role)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  assignedToMe?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by inquiry status (can be a single status or comma-separated list)',
    example: 'pending,in_progress'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    if (typeof value === 'string') {
      return value.includes(',') ? value.split(',').map(s => s.trim()) : value;
    }
    return value;
  })
  status?: InquiryStatus | InquiryStatus[] | string | string[];
}