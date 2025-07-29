import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { QueueItem } from '../queue/entities/queue-item.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get<string>('DATABASE_URL'),
      entities: [User, Doctor, Appointment, QueueItem],
      synchronize: this.configService.get<string>('NODE_ENV') === 'development',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }
} 