import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';

@ApiTags('Tracking')
@ApiBearerAuth('JWT')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly httpService: HttpService) {}

  @Get(':orderId')
  @ApiOperation({
    summary: 'Última localização de um pedido',
    description:
      'Retorna a última posição registrada do entregador para o pedido informado. ' +
      'Para atualizações em tempo real, conecte-se via WebSocket diretamente ao tracking-service (porta 3006) ' +
      'usando os eventos: subscribe_order (assinar pedido) e location_updated (receber posição).',
  })
  @ApiParam({ name: 'orderId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Localização encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Nenhuma localização registrada para este pedido.' })
  getLastLocation(@Param('orderId') orderId: string) {
    return this.httpService
      .get<unknown>(`${process.env.TRACKING_SERVICE_URL}/tracking/${orderId}`)
      .pipe(map((r) => r.data));
  }
}
