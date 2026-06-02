import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@ApiTags('Payment')
@ApiBearerAuth('JWT')
@Controller('payments')
export class PaymentController {
  constructor(private readonly httpService: HttpService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pagamento para um pedido' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou pagamento ativo já existente.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() body: CreatePaymentDto) {
    return this.httpService
      .post<unknown>(`${process.env.PAYMENT_SERVICE_URL}/payments`, body)
      .pipe(map((r) => r.data));
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.httpService
      .get<unknown>(`${process.env.PAYMENT_SERVICE_URL}/payments`)
      .pipe(map((r) => r.data));
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Buscar pagamento pelo ID do pedido' })
  @ApiParam({ name: 'orderId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.httpService
      .get<unknown>(`${process.env.PAYMENT_SERVICE_URL}/payments/order/${orderId}`)
      .pipe(map((r) => r.data));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.httpService
      .get<unknown>(`${process.env.PAYMENT_SERVICE_URL}/payments/${id}`)
      .pipe(map((r) => r.data));
  }

  @Patch(':id/process')
  @ApiOperation({
    summary: 'Processar pagamento (confirmar, falhar ou estornar)',
    description: 'Atualiza o status do pagamento. Só aceita pagamentos com status PENDING.',
  })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: ProcessPaymentDto })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou pagamento não está pendente.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  process(@Param('id') id: string, @Body() body: ProcessPaymentDto) {
    return this.httpService
      .patch<unknown>(`${process.env.PAYMENT_SERVICE_URL}/payments/${id}/process`, body)
      .pipe(map((r) => r.data));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pagamento (apenas PENDING ou FAILED)' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pagamento removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou pagamento confirmado não pode ser removido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  remove(@Param('id') id: string) {
    return this.httpService
      .delete<unknown>(`${process.env.PAYMENT_SERVICE_URL}/payments/${id}`)
      .pipe(map((r) => r.data));
  }
}
