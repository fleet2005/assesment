import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum QueueStatus {
  WAITING = 'waiting',
  WITH_DOCTOR = 'with_doctor',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum QueuePriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

@Entity('queue_items')
export class QueueItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientName: string;

  @Column()
  patientPhone: string;

  @Column({ nullable: true })
  patientEmail: string;

  @Column({ type: 'text', nullable: true })
  patientNotes: string;

  @Column({ type: 'text', nullable: true })
  symptoms: string;

  @Column({
    type: 'enum',
    enum: QueueStatus,
    default: QueueStatus.WAITING,
  })
  status: QueueStatus;

  @Column({
    type: 'enum',
    enum: QueuePriority,
    default: QueuePriority.NORMAL,
  })
  priority: QueuePriority;

  @Column({ type: 'timestamp', nullable: true })
  arrivalTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  calledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedTime: Date;

  @Column({ type: 'int', default: 0 })
  estimatedWaitTime: number; // in minutes

  @ManyToOne(() => Doctor, { nullable: true })
  @JoinColumn({ name: 'assignedDoctorId' })
  assignedDoctor: Doctor;

  @Column({ nullable: true })
  assignedDoctorId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get queueNumber(): number {
    // This would be calculated based on the queue position
    return 0;
  }

  get waitTime(): number {
    if (!this.arrivalTime) return 0;
    const now = new Date();
    const arrival = new Date(this.arrivalTime);
    return Math.floor((now.getTime() - arrival.getTime()) / (1000 * 60)); // minutes
  }
} 