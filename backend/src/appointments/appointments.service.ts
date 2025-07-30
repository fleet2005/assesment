import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto, FilterAppointmentsDto } from './dto/appointment.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { Not } from 'typeorm';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private doctorsService: DoctorsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { doctorId, appointmentDate, startTime, endTime } = createAppointmentDto;

    // Check if doctor exists
    const doctor = await this.doctorsService.findOne(doctorId);

    // Check for scheduling conflicts - check for time overlaps
    const conflictingAppointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    // Check if any existing appointment overlaps with the new appointment
    const hasConflict = conflictingAppointments.some(existingAppointment => {
      const existingStart = existingAppointment.startTime;
      const existingEnd = existingAppointment.endTime;
      
      // Check if the new appointment overlaps with any existing appointment
      // Overlap occurs if:
      // 1. New start time is before existing end time AND new end time is after existing start time
      // 2. Or if the appointments are exactly the same time
      return (
        (startTime < existingEnd && endTime > existingStart) ||
        (startTime === existingStart && endTime === existingEnd)
      );
    });

    if (hasConflict) {
      throw new ConflictException('Doctor has a conflicting appointment at this time');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      appointmentDate: new Date(appointmentDate),
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(filterDto: FilterAppointmentsDto = {}): Promise<{ appointments: any[]; total: number }> {
    const { patientName, doctorId, status, date, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor');

    if (patientName) {
      queryBuilder.andWhere('appointment.patientName ILIKE :patientName', { patientName: `%${patientName}%` });
    }

    if (doctorId) {
      queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId });
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      queryBuilder.andWhere('appointment.appointmentDate BETWEEN :startDate AND :endDate', {
        startDate: startOfDay,
        endDate: endOfDay,
      });
    }

    const [appointments, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.startTime', 'ASC')
      .getManyAndCount();

    // Transform appointments to include doctorName
    const transformedAppointments = appointments.map(appointment => ({
      ...appointment,
      doctorName: appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'Unknown Doctor'
    }));

    return { appointments: transformedAppointments, total };
  }

  async findOne(id: string): Promise<any> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Transform appointment to include doctorName
    return {
      ...appointment,
      doctorName: appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'Unknown Doctor'
    };
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check for conflicts if time/date is being updated
    if (updateAppointmentDto.appointmentDate || updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
      const appointmentDate = updateAppointmentDto.appointmentDate || appointment.appointmentDate;
      const startTime = updateAppointmentDto.startTime || appointment.startTime;
      const endTime = updateAppointmentDto.endTime || appointment.endTime;

      const conflictingAppointment = await this.appointmentRepository.findOne({
        where: {
          doctorId: appointment.doctorId,
          appointmentDate: new Date(appointmentDate),
          status: AppointmentStatus.SCHEDULED,
          id: Not(id),
        },
      });

      if (conflictingAppointment) {
        throw new ConflictException('Doctor has a conflicting appointment at this time');
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    const doctor = await this.doctorsService.findOne(doctorId);
    const appointmentDate = new Date(date);
    
    // Get doctor's availability for the day
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[appointmentDate.getDay()];
    const availability = doctor.availability[dayOfWeek];

    if (!availability.available) {
      return [];
    }

    // Get existing appointments for the day
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        appointmentDate,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    // Generate 30-minute slots
    const slots: string[] = [];
    const startTime = new Date(`2000-01-01T${availability.start}`);
    const endTime = new Date(`2000-01-01T${availability.end}`);

    while (startTime < endTime) {
      const slotTime = startTime.toTimeString().slice(0, 5);
      
      // Check if slot is available by checking if any appointment overlaps with this slot
      const isBooked = existingAppointments.some(appointment => {
        const appointmentStart = appointment.startTime;
        const appointmentEnd = appointment.endTime;
        
        // Normalize time formats - remove seconds if present
        const normalizedAppointmentStart = appointmentStart.split(':').slice(0, 2).join(':');
        const normalizedSlotTime = slotTime;
        
        // Check if the slot overlaps with any existing appointment
        // Only block the start time slot, not the end time slot
        const booked = normalizedSlotTime === normalizedAppointmentStart;
        
        // Debug logging
        console.log(`Slot: ${normalizedSlotTime}, Appointment: ${normalizedAppointmentStart}-${appointmentEnd}, Booked: ${booked}`);
        
        return booked;
      });

      if (!isBooked) {
        slots.push(slotTime);
      }

      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    return slots;
  }

  async createSampleAppointments(): Promise<void> {
    const sampleAppointments = [
      {
        patientName: 'Alice Brown',
        patientPhone: '+1234567890',
        patientEmail: 'alice.brown@email.com',
        appointmentDate: new Date('2024-01-15'),
        startTime: '10:00',
        endTime: '10:30',
        type: 'consultation',
        status: AppointmentStatus.SCHEDULED,
        doctorId: 'sample-doctor-id-1',
      },
      {
        patientName: 'Charlie Davis',
        patientPhone: '+1234567891',
        patientEmail: 'charlie.davis@email.com',
        appointmentDate: new Date('2024-01-15'),
        startTime: '11:30',
        endTime: '12:00',
        type: 'follow_up',
        status: AppointmentStatus.SCHEDULED,
        doctorId: 'sample-doctor-id-2',
      },
      {
        patientName: 'Eva White',
        patientPhone: '+1234567892',
        patientEmail: 'eva.white@email.com',
        appointmentDate: new Date('2024-01-15'),
        startTime: '14:00',
        endTime: '14:30',
        type: 'routine_checkup',
        status: AppointmentStatus.SCHEDULED,
        doctorId: 'sample-doctor-id-3',
      },
    ];

    for (const appointmentData of sampleAppointments) {
      const existingAppointment = await this.appointmentRepository.findOne({
        where: {
          patientName: appointmentData.patientName,
          appointmentDate: appointmentData.appointmentDate,
        },
      });

      if (!existingAppointment) {
        const appointment = this.appointmentRepository.create({
          ...appointmentData,
          type: appointmentData.type as AppointmentType,
        });
        await this.appointmentRepository.save(appointment);
      }
    }

    console.log('Sample appointments created');
  }
} 