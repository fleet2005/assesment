import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueueService } from './queue.service';
import { QueueItem, QueueStatus, QueuePriority } from './entities/queue-item.entity';

@ApiTags('Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new patient to the queue' })
  @ApiResponse({ status: 201, description: 'Patient added to queue successfully', type: QueueItem })
  create(@Body() createQueueItemDto: any): Promise<QueueItem> {
    return this.queueService.create(createQueueItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients in the queue' })
  @ApiResponse({ status: 200, description: 'Queue items retrieved successfully' })
  findAll(): Promise<QueueItem[]> {
    return this.queueService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics retrieved successfully' })
  getStats() {
    return this.queueService.getQueueStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a queue item by ID' })
  @ApiResponse({ status: 200, description: 'Queue item retrieved successfully', type: QueueItem })
  @ApiResponse({ status: 404, description: 'Queue item not found' })
  findOne(@Param('id') id: string): Promise<QueueItem> {
    return this.queueService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a queue item' })
  @ApiResponse({ status: 200, description: 'Queue item updated successfully', type: QueueItem })
  @ApiResponse({ status: 404, description: 'Queue item not found' })
  update(@Param('id') id: string, @Body() updateQueueItemDto: any): Promise<QueueItem> {
    return this.queueService.update(id, updateQueueItemDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update queue item status' })
  @ApiResponse({ status: 200, description: 'Queue item status updated successfully', type: QueueItem })
  @ApiResponse({ status: 404, description: 'Queue item not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: QueueStatus,
  ): Promise<QueueItem> {
    return this.queueService.updateStatus(id, status);
  }

  @Patch(':id/priority')
  @ApiOperation({ summary: 'Update queue item priority' })
  @ApiResponse({ status: 200, description: 'Queue item priority updated successfully', type: QueueItem })
  @ApiResponse({ status: 404, description: 'Queue item not found' })
  updatePriority(
    @Param('id') id: string,
    @Body('priority') priority: QueuePriority,
  ): Promise<QueueItem> {
    return this.queueService.updatePriority(id, priority);
  }

  @Patch(':id/assign-doctor')
  @ApiOperation({ summary: 'Assign a doctor to a queue item' })
  @ApiResponse({ status: 200, description: 'Doctor assigned successfully', type: QueueItem })
  @ApiResponse({ status: 404, description: 'Queue item not found' })
  assignDoctor(
    @Param('id') id: string,
    @Body('doctorId') doctorId: string,
  ): Promise<QueueItem> {
    return this.queueService.assignDoctor(id, doctorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a patient from the queue' })
  @ApiResponse({ status: 200, description: 'Patient removed from queue successfully' })
  @ApiResponse({ status: 404, description: 'Queue item not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.queueService.remove(id);
  }
} 