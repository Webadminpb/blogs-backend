import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Settings, SettingsSchema } from './settings.schema';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from '../lib/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
    ]),
    AuthModule,
  ],
  providers: [SettingsService, S3Service],
  controllers: [SettingsController],
  exports: [SettingsService, S3Service],
})
export class SettingsModule {}
