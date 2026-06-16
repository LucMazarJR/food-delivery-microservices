import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@ApiTags('Menu')
@ApiBearerAuth('JWT')
@Controller('menu')
export class MenuController {
  constructor(private readonly httpService: HttpService) {}

  @Post()
  @ApiOperation({ summary: 'Criar item do cardápio', description: 'Cria um novo item vinculado a um restaurante.' })
  @ApiBody({ type: CreateMenuItemDto })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() body: CreateMenuItemDto) {
    return this.httpService
      .post<unknown>(`${process.env.MENU_SERVICE_URL}/menu`, body)
      .pipe(map((r) => r.data));
  }

  @Get()
  @ApiOperation({ summary: 'Listar itens do cardápio', description: 'Retorna todos os itens cadastrados.' })
  @ApiResponse({ status: 200, description: 'Lista de itens.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.httpService
      .get<unknown>(`${process.env.MENU_SERVICE_URL}/menu`)
      .pipe(map((r) => r.data));
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar itens por restaurante' })
  @ApiParam({ name: 'restaurantId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Itens do restaurante.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.httpService
      .get<unknown>(`${process.env.MENU_SERVICE_URL}/menu/restaurant/${restaurantId}`)
      .pipe(map((r) => r.data));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Item encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.httpService
      .get<unknown>(`${process.env.MENU_SERVICE_URL}/menu/${id}`)
      .pipe(map((r) => r.data));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item do cardápio' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateMenuItemDto })
  @ApiResponse({ status: 200, description: 'Item atualizado.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  update(@Param('id') id: string, @Body() body: UpdateMenuItemDto) {
    return this.httpService
      .patch<unknown>(`${process.env.MENU_SERVICE_URL}/menu/${id}`, body)
      .pipe(map((r) => r.data));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover item do cardápio' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Item removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  remove(@Param('id') id: string) {
    return this.httpService
      .delete<unknown>(`${process.env.MENU_SERVICE_URL}/menu/${id}`)
      .pipe(map((r) => r.data));
  }
}
