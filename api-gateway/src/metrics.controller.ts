import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { register } from 'prom-client';
import { Public } from './decorators/jwt_public.decorator';

@Public()
@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  @Get()
  async index(@Res({ passthrough: false }) response: Response): Promise<void> {
    response.header('Content-Type', register.contentType);
    response.send(await register.metrics());
  }
}
