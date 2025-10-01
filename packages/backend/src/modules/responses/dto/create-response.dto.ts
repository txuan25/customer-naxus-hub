import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResponseDto {
  @ApiProperty({ description: 'Response message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Inquiry ID this response is for' })
  @IsUUID()
  inquiryId: string;
}