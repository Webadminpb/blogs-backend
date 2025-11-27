import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Submenu extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ unique: true, required: true, lowercase: true })
  slug!: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true })
  parent_id!: Types.ObjectId;

  @Prop({ default: false })
  showOnHomePage?: boolean;

  @Prop({ default: true })
  status!: boolean;
}

export const SubmenuSchema = SchemaFactory.createForClass(Submenu);
