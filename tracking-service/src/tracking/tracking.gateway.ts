import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UpdateLocationDto } from './dto/update-location.dto';
import { TrackingService } from './tracking.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly trackingService: TrackingService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_order')
  handleSubscribe(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(`order:${orderId}`);
    return { event: 'subscribed', data: orderId };
  }

  @SubscribeMessage('update_location')
  @UsePipes(new ValidationPipe({ whitelist: true, exceptionFactory: (e) => new WsException(e) }))
  async handleLocationUpdate(
    @MessageBody() dto: UpdateLocationDto,
  ) {
    const location = await this.trackingService.upsertLocation(dto);
    this.server.to(`order:${dto.orderId}`).emit('location_updated', location);
    return location;
  }
}
