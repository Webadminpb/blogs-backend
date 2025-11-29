import {
  Body,
  UseGuards,
  Req,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  HttpException,
  HttpStatus,
  ForbiddenException,
  ValidationPipe,
  UsePipes,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user.schema';
import { Request } from 'express';

type CreateUserPayload = Partial<{
  name: string;
  email: string;
  password: string;
  role: UserRole;
}>;

const isDuplicateKeyError = (error: unknown): error is { code: number } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'number' &&
    (error as { code: number }).code === 11000
  );
};

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    try {
      if (search) {
        const users = await this.users.search(search);
        return { items: users };
      }
      const users = await this.users.findAll();
      return { items: users };
    } catch {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() body: CreateUserPayload) {
    try {
      if (!body?.name || !body.role) {
        throw new HttpException(
          'Missing required user fields',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (body.role !== UserRole.AUTHOR) {
        if (!body.email || !body.password) {
          throw new HttpException(
            'Email and password are required for non-author users',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      return await this.users.create(body);
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        // Duplicate email error from MongoDB
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Failed to create user';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.users.findOne(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'User not found';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Req()
    req: Request & {
      user: {
        id: string;
        role: string;
      };
    },
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    // allow if user is admin or updating own profile
    const requester = req.user;
    if (requester.role !== 'admin' && requester.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return await this.users.update(id, body);
  }

  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req()
    req: Request & {
      user: {
        id: string;
        role: string;
      };
    },
  ) {
    // Verify user can only upload their own avatar (unless admin)
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('You can only upload your own avatar');
    }

    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    // Upload to S3
    const s3Service = new (await import('../lib/s3.service')).S3Service();
    const result = await s3Service.uploadFile(file, 'avatars');

    // Update user image
    await this.users.update(id, { image: result.secure_url });

    return {
      url: result.secure_url,
      message: 'Avatar uploaded successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    try {
      return await this.users.remove(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const message =
        error instanceof Error ? error.message : 'Failed to delete user';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
