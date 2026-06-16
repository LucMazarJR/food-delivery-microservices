import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'X-Burguer', description: 'Nome do item' })
  name: string;

  @ApiProperty({ example: 'Pão, carne 150g, queijo e alface', description: 'Descrição do item' })
  description: string;

  @ApiProperty({ example: 25.9, description: 'Preço em reais' })
  price: number;

  @ApiProperty({ example: 'Lanches', description: 'Categoria do item' })
  category: string;

  @ApiProperty({ example: '664f1b2e8f1a2b3c4d5e6f7a', description: 'ID do restaurante' })
  restaurantId: string;

  @ApiPropertyOptional({ example: true, description: 'Se o item está disponível' })
  available?: boolean;
}
