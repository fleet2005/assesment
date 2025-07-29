import { IsString, IsDateString, IsEnum, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  patientName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  patientPhone: string;

  @ApiProperty({ example: 'john.doe@email.com', required: false })
  @IsOptional()
  @IsString()
  patientEmail?: string;

  @ApiProperty({ example: 'Patient has allergies to penicillin', required: false })
  @IsOptional()
  @IsString()
  patientNotes?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '10:30' })
  @IsString()
  endTime: string;

  @ApiProperty({ enum: AppointmentType, example: AppointmentType.CONSULTATION })
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiProperty({ example: 'Regular checkup', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ example: 'doctor-uuid-here' })
  @IsUUID()
  doctorId: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  patientPhone?: string;

  @ApiProperty({ example: 'john.doe@email.com', required: false })
  @IsOptional()
  @IsString()
  patientEmail?: string;

  @ApiProperty({ example: 'Patient has allergies to penicillin', required: false })
  @IsOptional()
  @IsString()
  patientNotes?: string;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({ example: '10:00', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ example: '10:30', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ enum: AppointmentStatus, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ enum: AppointmentType, required: false })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiProperty({ example: 'Regular checkup', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ example: 'doctor-uuid-here', required: false })
  @IsOptional()
  @IsUUID()
  doctorId?: string;
}

export class FilterAppointmentsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiProperty({ enum: AppointmentStatus, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;
} 