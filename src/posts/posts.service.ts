import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {
    console.log('>>> PostsService is injecting model with name:', Post.name);
  }

  async findAll(menu?: string, submenu?: string) {
    const query = this.postModel
      .find()
      .populate(
        'authors._id',
        'name email image description education address instagram linkedin index',
      )
      .sort({ index: 1, createdAt: -1 });

    if (menu) {
      query.where({ $or: [{ menus: menu }, { menu }] });
    }

    if (submenu) {
      query.where({ $or: [{ submenus: submenu }, { submenu }] });
    }

    return query.lean().exec();
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate(
        'authors._id',
        'name email image description education address instagram linkedin index',
      )
      .lean()
      .exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(dto: CreatePostDto) {
    return this.postModel.create(dto);
  }

  async update(id: string, update: UpdatePostDto) {
    return this.postModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.postModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }

  async findByAuthor(authorId: string) {
    return this.postModel
      .find({ 'authors._id': authorId })
      .populate(
        'authors._id',
        'name email image description education address instagram linkedin index',
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
