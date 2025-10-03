import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseStatus } from '../../../common/enums/response-status.enum';

export class CreateResponseDto {
  @ApiProperty({ description: 'Response text content' })
  @IsString()
  @IsOptional()
  responseText?: string;

  @ApiProperty({ description: 'Inquiry ID this response is for' })
  @IsUUID()
  inquiryId: string;

  @ApiProperty({
    description: 'Response status',
    enum: ResponseStatus,
    default: ResponseStatus.DRAFT
  })
  @IsEnum(ResponseStatus)
  @IsOptional()
  status?: ResponseStatus;
}