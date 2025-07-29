import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, FilterAppointmentsDto } from './dto/appointment.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully', type: Appointment })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  findAll(@Query() filterDto: FilterAppointmentsDto) {
    return this.appointmentsService.findAll(filterDto);
  }

  @Get('slots/:doctorId/:date')
  @ApiOperation({ summary: 'Get available time slots for a doctor on a specific date' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Param('date') date: string,
  ): Promise<string[]> {
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully', type: Appointment })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully', type: Appointment })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Appointment status updated successfully', type: Appointment })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.appointmentsService.remove(id);
  }
} 