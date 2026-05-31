import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationDocument } from './schema/location.schema';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationModel: Model<LocationDocument>,
  ) {}

  async upsertLocation(dto: UpdateLocationDto): Promise<Location> {
    const result = await this.locationModel.findOneAndUpdate(
      { orderId: new Types.ObjectId(dto.orderId) },
      {
        $set: {
          deliveryPersonId: new Types.ObjectId(dto.deliveryPersonId),
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
        $setOnInsert: { orderId: new Types.ObjectId(dto.orderId) },
      },
      { upsert: true, new: true },
    );
    if (!result) throw new Error(`Falha ao salvar localização para o pedido ${dto.orderId}`);
    return result;
  }

  async getLastLocation(orderId: string): Promise<Location | null> {
    return this.locationModel
      .findOne({ orderId: new Types.ObjectId(orderId) })
      .exec();
  }
}
