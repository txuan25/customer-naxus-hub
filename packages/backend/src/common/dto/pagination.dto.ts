import { IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}