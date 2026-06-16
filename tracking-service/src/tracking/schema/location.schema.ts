import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true, type: Types.ObjectId })
  declare orderId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  declare deliveryPersonId: Types.ObjectId;

  @Prop({ required: true })
  declare latitude: number;

  @Prop({ required: true })
  declare longitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
