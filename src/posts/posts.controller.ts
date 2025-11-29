import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('blogs')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  async findAll(
    @Query('menu') menu?: string,
    @Query('submenu') submenu?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.posts.search(search);
    }
    return this.posts.findAll(menu, submenu);
  }

  @Post()
  async create(@Body() body: CreatePostDto) {
    return this.posts.create(body);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.posts.findBySlug(slug);
  }

  @Post(':id/view')
  async incrementViews(@Param('id') id: string) {
    return this.posts.incrementViews(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.posts.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.posts.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }
}
