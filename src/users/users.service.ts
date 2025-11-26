import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findAuthors(): Promise<UserDocument[]> {
    return this.userModel
      .find({ role: UserRole.AUTHOR })
      .select('-password')
      .sort({ index: 1, name: 1 })
      .exec();
  }

  async findAuthorById(id: string): Promise<UserDocument> {
    const author = await this.userModel.findById(id).select('-password').exec();
    if (!author || author.role !== UserRole.AUTHOR) {
      throw new NotFoundException('Author not found');
    }
    return author;
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    if (!email) return null;
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    data.role = data.role || UserRole.USER;

    if (!data.email && data.role !== UserRole.AUTHOR) {
      throw new BadRequestException('Email is required');
    }

    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (typeof data.index !== 'number') {
      data.index = 0;
    }

    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument> {
    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10);
    }
    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && String(existingUser._id) !== id) {
        const err = new BadRequestException('Email already exists');
        throw err;
      }
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async remove(id: string): Promise<UserDocument> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('User not found');
    return deleted;
  }
}
