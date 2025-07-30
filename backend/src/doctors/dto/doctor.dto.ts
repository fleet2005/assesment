import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DoctorSpecialization, DoctorGender, DoctorStatus } from '../entities/doctor.entity';

export class CreateDoctorDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.smith@clinic.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ enum: DoctorSpecialization, example: DoctorSpecialization.GENERAL_PRACTICE })
  @IsEnum(DoctorSpecialization)
  specialization: DoctorSpecialization;

  @ApiProperty({ enum: DoctorGender, example: DoctorGender.MALE })
  @IsEnum(DoctorGender)
  gender: DoctorGender;

  @ApiProperty({ example: 'Room 101, Floor 1' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Experienced general practitioner with 10 years of experience.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ enum: DoctorStatus, example: DoctorStatus.AVAILABLE, required: false })
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;

  @ApiProperty({
    example: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  availability?: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
}

export class UpdateDoctorDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Smith', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'john.smith@clinic.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: DoctorSpecialization, required: false })
  @IsOptional()
  @IsEnum(DoctorSpecialization)
  specialization?: DoctorSpecialization;

  @ApiProperty({ enum: DoctorGender, required: false })
  @IsOptional()
  @IsEnum(DoctorGender)
  gender?: DoctorGender;

  @ApiProperty({ example: 'Room 101, Floor 1', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ enum: DoctorStatus, required: false })
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;

  @ApiProperty({ example: 'Experienced general practitioner with 10 years of experience.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  availability?: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FilterDoctorsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: DoctorSpecialization, required: false })
  @IsOptional()
  @IsEnum(DoctorSpecialization)
  specialization?: DoctorSpecialization;

  @ApiProperty({ enum: DoctorStatus, required: false })
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;
} 