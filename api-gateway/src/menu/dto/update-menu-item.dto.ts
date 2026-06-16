import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ example: 'X-Burguer', description: 'Nome do item' })
  name?: string;

  @ApiPropertyOptional({ example: 'Pão, carne 150g, queijo e alface', description: 'Descrição do item' })
  description?: string;

  @ApiPropertyOptional({ example: 25.9, description: 'Preço em reais' })
  price?: number;

  @ApiPropertyOptional({ example: 'Lanches', description: 'Categoria do item' })
  category?: string;

  @ApiPropertyOptional({ example: '664f1b2e8f1a2b3c4d5e6f7a', description: 'ID do restaurante' })
  restaurantId?: string;

  @ApiPropertyOptional({ example: true, description: 'Se o item está disponível' })
  available?: boolean;
}
