import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  // Use definite assignment assertions because Mongoose initializes these at runtime
  @Prop({ required: true, default: 'My Site' })
  siteName!: string;

  @Prop({ required: true, default: 'Site description' })
  siteDescription!: string;

  @Prop({ default: '' })
  logo?: string;

  @Prop({ default: '' })
  favicon?: string;

  @Prop({
    type: Object,
    default: { email: '', phone: '', address: '' },
  })
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };

  @Prop({
    type: Object,
    default: { facebook: '', twitter: '', instagram: '', linkedin: '' },
  })
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };

  @Prop({
    type: Object,
    default: { metaTitle: '', metaDescription: '', keywords: [] },
  })
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  @Prop({ default: 'light' })
  theme!: 'light' | 'dark' | 'system';

  @Prop({ default: 10 })
  postsPerPage!: number;

  // audit fields
  @Prop({ default: null })
  lastEditedBy?: string; // store user id or email

  @Prop({
    type: Array,
    default: [],
  })
  history?: {
    updatedAt?: Date;
    updatedBy?: string;
    diff?: Record<string, any>;
  }[];
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
