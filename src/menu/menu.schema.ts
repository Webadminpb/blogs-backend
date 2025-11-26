import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Menu extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ unique: true, required: true, lowercase: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ type: Number, required: true, default: 0 })
  index: number;

  @Prop({ default: true })
  status: boolean;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
