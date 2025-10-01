import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveResponseDto {
  @ApiPropertyOptional({ description: 'Approval notes from manager' })
  @IsString()
  @IsOptional()
  approvalNotes?: string;
}

export class RejectResponseDto {
  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsString()
  rejectionReason: string;
}