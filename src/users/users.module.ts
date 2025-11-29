import { UsersController } from './users.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { AuthorsController } from './authors.controller';
import { PostsModule } from '../posts/posts.module';
import { S3Service } from '../lib/s3.service';

@Module({
  imports: [
    PostsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthorsController],
  providers: [UsersService, S3Service],
  exports: [UsersService],
})
export class UsersModule {}
