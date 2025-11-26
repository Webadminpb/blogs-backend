import { UsersController } from './users.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { AuthorsController } from './authors.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    PostsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthorsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
