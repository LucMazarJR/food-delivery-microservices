import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  CASH = 'CASH',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID do pedido', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  orderId: string;

  @ApiProperty({ description: 'Valor total do pagamento em reais', example: 59.9 })
  amount: number;

  @ApiProperty({ description: 'Método de pagamento', enum: PaymentMethod, example: PaymentMethod.PIX })
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'ID da transação no gateway externo', example: 'txn_abc123' })
  externalTransactionId?: string;
}
