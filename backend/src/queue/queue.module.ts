import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QueueItem } from './entities/queue-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QueueItem])],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {} 