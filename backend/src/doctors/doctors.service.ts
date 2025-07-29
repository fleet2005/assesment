import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Doctor, DoctorStatus } from './entities/doctor.entity';
import { CreateDoctorDto, UpdateDoctorDto, FilterDoctorsDto } from './dto/doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Check if doctor with email already exists
    const existingDoctor = await this.doctorRepository.findOne({
      where: { email: createDoctorDto.email },
    });

    if (existingDoctor) {
      throw new ConflictException('Doctor with this email already exists');
    }

    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async findAll(filterDto: FilterDoctorsDto = {}): Promise<{ doctors: Doctor[]; total: number }> {
    const { search, specialization, status, location, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.doctorRepository.createQueryBuilder('doctor');

    if (search) {
      queryBuilder.andWhere(
        '(doctor.firstName ILIKE :search OR doctor.lastName ILIKE :search OR doctor.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (specialization) {
      queryBuilder.andWhere('doctor.specialization = :specialization', { specialization });
    }

    if (status) {
      queryBuilder.andWhere('doctor.status = :status', { status });
    }

    if (location) {
      queryBuilder.andWhere('doctor.location ILIKE :location', { location: `%${location}%` });
    }

    queryBuilder.andWhere('doctor.isActive = :isActive', { isActive: true });

    const [doctors, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('doctor.firstName', 'ASC')
      .getManyAndCount();

    return { doctors, total };
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id, isActive: true },
      relations: ['appointments'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);

    // Check if email is being updated and if it conflicts
    if (updateDoctorDto.email && updateDoctorDto.email !== doctor.email) {
      const existingDoctor = await this.doctorRepository.findOne({
        where: { email: updateDoctorDto.email },
      });

      if (existingDoctor) {
        throw new ConflictException('Doctor with this email already exists');
      }
    }

    Object.assign(doctor, updateDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    doctor.isActive = false;
    await this.doctorRepository.save(doctor);
  }

  async updateStatus(id: string, status: DoctorStatus): Promise<Doctor> {
    const doctor = await this.findOne(id);
    doctor.status = status;
    return this.doctorRepository.save(doctor);
  }

  async getAvailableDoctors(): Promise<Doctor[]> {
    return this.doctorRepository.find({
      where: { status: DoctorStatus.AVAILABLE, isActive: true },
      order: { firstName: 'ASC' },
    });
  }

  async createSampleDoctors(): Promise<void> {
    const sampleDoctors = [
      {
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@clinic.com',
        phone: '+1234567890',
        specialization: 'General Practice' as any,
        gender: 'female' as any,
        location: 'Room 101, Floor 1',
        status: 'available' as any,
        bio: 'Experienced general practitioner with 10 years of experience.',
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '13:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false },
        },
      },
      {
        firstName: 'Dr. Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@clinic.com',
        phone: '+1234567891',
        specialization: 'Pediatrics' as any,
        gender: 'male' as any,
        location: 'Room 102, Floor 1',
        status: 'busy' as any,
        bio: 'Specialized in pediatric care with 8 years of experience.',
        availability: {
          monday: { start: '08:00', end: '16:00', available: true },
          tuesday: { start: '08:00', end: '16:00', available: true },
          wednesday: { start: '08:00', end: '16:00', available: true },
          thursday: { start: '08:00', end: '16:00', available: true },
          friday: { start: '08:00', end: '16:00', available: true },
          saturday: { start: '08:00', end: '12:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false },
        },
      },
      {
        firstName: 'Dr. Emily',
        lastName: 'Lee',
        email: 'emily.lee@clinic.com',
        phone: '+1234567892',
        specialization: 'Cardiology' as any,
        gender: 'female' as any,
        location: 'Room 201, Floor 2',
        status: 'off_duty' as any,
        bio: 'Cardiologist with expertise in heart conditions.',
        availability: {
          monday: { start: '10:00', end: '18:00', available: true },
          tuesday: { start: '10:00', end: '18:00', available: true },
          wednesday: { start: '10:00', end: '18:00', available: true },
          thursday: { start: '10:00', end: '18:00', available: true },
          friday: { start: '10:00', end: '18:00', available: true },
          saturday: { start: '00:00', end: '00:00', available: false },
          sunday: { start: '00:00', end: '00:00', available: false },
        },
      },
      {
        firstName: 'Dr. Raj',
        lastName: 'Patel',
        email: 'raj.patel@clinic.com',
        phone: '+1234567893',
        specialization: 'Dermatology' as any,
        gender: 'male' as any,
        location: 'Room 103, Floor 1',
        status: 'available' as any,
        bio: 'Dermatologist specializing in skin conditions and treatments.',
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '13:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false },
        },
      },
    ];

    for (const doctorData of sampleDoctors) {
      const existingDoctor = await this.doctorRepository.findOne({
        where: { email: doctorData.email },
      });

      if (!existingDoctor) {
        const doctor = this.doctorRepository.create(doctorData);
        await this.doctorRepository.save(doctor);
      }
    }

    console.log('Sample doctors created');
  }
} 