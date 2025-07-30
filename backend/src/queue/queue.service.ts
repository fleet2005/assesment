import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueItem, QueueStatus, QueuePriority } from './entities/queue-item.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueItem)
    private queueItemRepository: Repository<QueueItem>,
  ) {}

  async create(createQueueItemDto: any): Promise<QueueItem> {
    const queueItem = this.queueItemRepository.create({
      ...createQueueItemDto,
      arrivalTime: new Date(),
      estimatedWaitTime: 15, // Default 15 minutes
    });

    const savedQueueItem = await this.queueItemRepository.save(queueItem);
    return Array.isArray(savedQueueItem) ? savedQueueItem[0] : savedQueueItem;
  }

  async findAll(): Promise<QueueItem[]> {
    return this.queueItemRepository.find({
      order: { priority: 'DESC', arrivalTime: 'ASC' },
      relations: ['assignedDoctor'],
    });
  }

  async findOne(id: string): Promise<QueueItem> {
    const queueItem = await this.queueItemRepository.findOne({
      where: { id },
      relations: ['assignedDoctor'],
    });

    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    return queueItem;
  }

  async update(id: string, updateQueueItemDto: any): Promise<QueueItem> {
    const queueItem = await this.findOne(id);
    Object.assign(queueItem, updateQueueItemDto);
    return this.queueItemRepository.save(queueItem);
  }

  async remove(id: string): Promise<void> {
    const queueItem = await this.findOne(id);
    await this.queueItemRepository.remove(queueItem);
  }

  async updateStatus(id: string, status: QueueStatus): Promise<QueueItem> {
    const queueItem = await this.findOne(id);
    queueItem.status = status;

    if (status === QueueStatus.WITH_DOCTOR) {
      queueItem.calledTime = new Date();
    } else if (status === QueueStatus.COMPLETED) {
      queueItem.completedTime = new Date();
    }

    return this.queueItemRepository.save(queueItem);
  }

  async updatePriority(id: string, priority: QueuePriority): Promise<QueueItem> {
    const queueItem = await this.findOne(id);
    queueItem.priority = priority;
    return this.queueItemRepository.save(queueItem);
  }

  async assignDoctor(id: string, doctorId: string): Promise<QueueItem> {
    const queueItem = await this.findOne(id);
    queueItem.assignedDoctorId = doctorId;
    return this.queueItemRepository.save(queueItem);
  }

  async getQueueStats(): Promise<{
    waiting: number;
    withDoctor: number;
    completed: number;
    total: number;
  }> {
    const [waiting, withDoctor, completed, total] = await Promise.all([
      this.queueItemRepository.count({ where: { status: QueueStatus.WAITING } }),
      this.queueItemRepository.count({ where: { status: QueueStatus.WITH_DOCTOR } }),
      this.queueItemRepository.count({ where: { status: QueueStatus.COMPLETED } }),
      this.queueItemRepository.count(),
    ]);

    return { waiting, withDoctor, completed, total };
  }

  async createSampleQueueItems(): Promise<void> {
    const sampleQueueItems = [
      {
        patientName: 'John Doe',
        patientPhone: '+1234567890',
        symptoms: 'Headache and fever',
        priority: QueuePriority.NORMAL,
        status: QueueStatus.WAITING,
        estimatedWaitTime: 15,
      },
      {
        patientName: 'Jane Smith',
        patientPhone: '+1234567891',
        symptoms: 'Chest pain',
        priority: QueuePriority.URGENT,
        status: QueueStatus.WITH_DOCTOR,
        estimatedWaitTime: 0,
        calledTime: new Date(),
      },
      {
        patientName: 'Bob Johnson',
        patientPhone: '+1234567892',
        symptoms: 'Severe bleeding',
        priority: QueuePriority.EMERGENCY,
        status: QueueStatus.WAITING,
        estimatedWaitTime: 5,
      },
    ];

    for (const queueItemData of sampleQueueItems) {
      const existingItem = await this.queueItemRepository.findOne({
        where: { patientName: queueItemData.patientName },
      });

      if (!existingItem) {
        const queueItem = this.queueItemRepository.create(queueItemData);
        await this.queueItemRepository.save(queueItem);
      }
    }

    console.log('Sample queue items created');
  }
} 