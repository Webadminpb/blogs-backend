import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { PostsService } from '../posts/posts.service';

@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  async listAuthors() {
    return this.usersService.findAuthors();
  }

  @Get(':id')
  async getAuthor(@Param('id') id: string) {
    return this.usersService.findAuthorById(id);
  }

  @Get(':id/blogs')
  async getAuthorBlogs(@Param('id') id: string) {
    return this.postsService.findByAuthor(id);
  }
}
