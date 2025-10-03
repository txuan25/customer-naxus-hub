import { PartialType } from '@nestjs/swagger';
import { CreateResponseDto } from './create-response.dto';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResponseDto extends PartialType(CreateResponseDto) {
  @ApiPropertyOptional({ description: 'Updated response text' })
  @IsString()
  @IsOptional()
  responseText?: string;
}