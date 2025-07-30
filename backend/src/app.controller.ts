import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'Clinic Manager API',
      status: 'running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      message: 'API is healthy',
      timestamp: new Date().toISOString()
    };
  }

  @Get('favicon.ico')
  favicon(@Res() res: Response) {
    res.status(204).send();
  }
} 