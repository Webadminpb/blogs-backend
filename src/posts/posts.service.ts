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

    const posts = await query.lean().exec();
    
    // Transform to frontend format (single menu/submenu)
    return posts.map(post => ({
      ...post,
      menu: post.menus?.[0] || (post as any).menu,
      submenu: post.submenus?.[0] || (post as any).submenu,
    }));
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
    // Handle both formats: convert single menu/submenu to arrays
    const data = {
      ...dto,
      menus: dto.menu ? [dto.menu] : (dto.menus || []),
      submenus: dto.submenu ? [dto.submenu] : (dto.submenus || []),
    };
    return this.postModel.create(data);
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

  async findBySlug(slug: string) {
    const post = await this.postModel
      .findOne({ slug })
      .populate(
        'authors._id',
        'name email image description education address instagram linkedin index',
      )
      .lean()
      .exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async search(query: string) {
    return this.postModel
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ],
      })
      .populate(
        'authors._id',
        'name email image description education address instagram linkedin index',
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async incrementViews(id: string) {
    const post = await this.postModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .exec();
    if (!post) throw new NotFoundException('Post not found');
    return { views: post.views };
  }
}
