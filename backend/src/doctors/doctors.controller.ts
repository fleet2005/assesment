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
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, UpdateDoctorDto, FilterDoctorsDto } from './dto/doctor.dto';
import { Doctor, DoctorStatus } from './entities/doctor.entity';

@ApiTags('Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully', type: Doctor })
  @ApiResponse({ status: 409, description: 'Doctor with this email already exists' })
  create(@Body() createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all doctors with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Doctors retrieved successfully' })
  findAll(@Query() filterDto: FilterDoctorsDto) {
    return this.doctorsService.findAll(filterDto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available doctors' })
  @ApiResponse({ status: 200, description: 'Available doctors retrieved successfully' })
  getAvailableDoctors(): Promise<Doctor[]> {
    return this.doctorsService.getAvailableDoctors();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor retrieved successfully', type: Doctor })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findOne(@Param('id') id: string): Promise<Doctor> {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a doctor' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully', type: Doctor })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  @ApiResponse({ status: 409, description: 'Doctor with this email already exists' })
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update doctor status' })
  @ApiResponse({ status: 200, description: 'Doctor status updated successfully', type: Doctor })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: DoctorStatus,
  ): Promise<Doctor> {
    return this.doctorsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a doctor (soft delete)' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.doctorsService.remove(id);
  }
} 