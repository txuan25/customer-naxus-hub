import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { Response } from '../../database/entities/response.entity';
import { InquiriesModule } from '@modules/inquiries/inquiries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Response]),
    InquiriesModule, // Import to use InquiriesService
  ],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}