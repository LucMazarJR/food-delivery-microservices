import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MenuController } from './menu.controller';

@Module({
  imports: [HttpModule],
  controllers: [MenuController],
})
export class MenuModule {}
