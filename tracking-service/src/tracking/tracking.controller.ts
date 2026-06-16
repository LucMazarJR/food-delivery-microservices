import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Última localização de um pedido' })
  @ApiParam({ name: 'orderId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Localização encontrada.' })
  @ApiResponse({ status: 404, description: 'Nenhuma localização registrada.' })
  async getLastLocation(@Param('orderId') orderId: string) {
    const location = await this.trackingService.getLastLocation(orderId);
    if (!location) throw new NotFoundException('Nenhuma localização registrada para este pedido.');
    return location;
  }
}
