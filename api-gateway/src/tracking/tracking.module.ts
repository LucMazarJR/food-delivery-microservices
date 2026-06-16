import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TrackingController } from './tracking.controller';

@Module({
  imports: [HttpModule],
  controllers: [TrackingController],
})
export class TrackingModule {}
