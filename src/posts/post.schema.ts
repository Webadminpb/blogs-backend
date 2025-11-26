import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ _id: false })
export class BlogAuthor {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  _id!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  image?: string;

  @Prop()
  description?: string;
}

const BlogAuthorSchema = SchemaFactory.createForClass(BlogAuthor);

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop()
  description?: string;

  @Prop()
  content?: string; // HTML

  @Prop({ type: [String], default: [] })
  menus!: string[];

  @Prop({ type: [String], default: [] })
  submenus!: string[];

  @Prop()
  thumbnail?: string;

  @Prop({ type: [BlogAuthorSchema], default: [] })
  authors!: BlogAuthor[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  status!: 'draft' | 'published';

  @Prop({ default: false })
  featured!: boolean;

  @Prop()
  shareUrl?: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: Number, default: 0 })
  views!: number;

  @Prop({ type: Number, default: 0 })
  index?: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
