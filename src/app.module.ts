import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// App Modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { MenuModule } from './menu/menu.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Connect to MongoDB
    MongooseModule.forRoot(process.env.MONGO_URI || '', {
      // optional mongoose options
    }),

    // App modules
    UsersModule,
    AuthModule,
    PostsModule,
    MenuModule,
    SettingsModule,
    DashboardModule,
    SeedModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      Logger.error(
        '❌ Missing MONGO_URI in .env file. Please check your backend .env',
        'AppModule',
      );
      throw new Error('MONGO_URI not defined in .env');
    }
  }
}
