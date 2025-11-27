import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop()
  password?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop()
  education?: string;

  @Prop()
  address?: string;

  @Prop()
  instagram?: string;

  @Prop()
  linkedin?: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop({ type: Number, default: 0 })
  index?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
