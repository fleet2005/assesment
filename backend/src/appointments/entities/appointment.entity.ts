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

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  ROUTINE_CHECKUP = 'routine_checkup',
  SPECIALIST_VISIT = 'specialist_visit',
}

@Entity('appointments')
export class Appointment {
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

  @Column({ type: 'timestamp' })
  appointmentDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.CONSULTATION,
  })
  type: AppointmentType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isUrgent: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get duration(): number {
    const start = new Date(`2000-01-01T${this.startTime}`);
    const end = new Date(`2000-01-01T${this.endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
  }

  get isOverlapping(): boolean {
    // This would be calculated based on other appointments
    return false;
  }
} 