import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum DoctorSpecialization {
  GENERAL_PRACTICE = 'General Practice',
  PEDIATRICS = 'Pediatrics',
  CARDIOLOGY = 'Cardiology',
  DERMATOLOGY = 'Dermatology',
  ORTHOPEDICS = 'Orthopedics',
  NEUROLOGY = 'Neurology',
  PSYCHIATRY = 'Psychiatry',
  SURGERY = 'Surgery',
  EMERGENCY_MEDICINE = 'Emergency Medicine',
  INTERNAL_MEDICINE = 'Internal Medicine',
}

export enum DoctorGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum DoctorStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFF_DUTY = 'off_duty',
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: DoctorSpecialization,
  })
  specialization: DoctorSpecialization;

  @Column({
    type: 'enum',
    enum: DoctorGender,
  })
  gender: DoctorGender;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: DoctorStatus,
    default: DoctorStatus.AVAILABLE,
  })
  status: DoctorStatus;

  @Column('json')
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get nextAvailableTime(): string {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);

    const todayAvailability = this.availability[currentDay as keyof typeof this.availability];
    
    if (!todayAvailability.available) {
      return 'Not available today';
    }

    if (currentTime < todayAvailability.start) {
      return `Today at ${todayAvailability.start}`;
    }

    if (currentTime >= todayAvailability.start && currentTime < todayAvailability.end) {
      return 'Now';
    }

    return 'Not available today';
  }
} 