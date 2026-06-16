import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentStatus {
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Novo status do pagamento',
    enum: PaymentStatus,
    example: PaymentStatus.CONFIRMED,
  })
  status: PaymentStatus;

  @ApiPropertyOptional({ description: 'ID da transação confirmada pelo gateway', example: 'txn_abc123' })
  externalTransactionId?: string;

  @ApiPropertyOptional({ description: 'Motivo da falha (quando status = FAILED)', example: 'Saldo insuficiente' })
  failureReason?: string;
}
