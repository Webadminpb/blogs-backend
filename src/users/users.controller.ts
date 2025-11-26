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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  async findAll() {
    try {
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

  @Delete(':id')
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
