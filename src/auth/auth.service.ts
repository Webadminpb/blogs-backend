// auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokenPayload, isAuthTokenPayload } from './types';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  private readonly jwtSecret = process.env.JWT_SECRET || 'secret-key';

  // Create JWT token
  private createToken(payload: AuthTokenPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '7d',
    }) as string;
    return token;
  }

  // Signup
  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already exists');

    const user = await this.usersService.create(dto);
    const token = this.createToken({
      id: String(user._id),
      email: user.email!,
      role: user.role,
    });

    return { message: 'Signup successful', token, user };
  }

  // Login
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    const token = this.createToken({
      id: String(user._id),
      email: user.email!,
      role: user.role,
    });

    return { message: 'Login successful', token, user };
  }

  // Get current user
  async me(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const decoded = jwt.verify(token, this.jwtSecret);
      if (!isAuthTokenPayload(decoded)) {
        throw new UnauthorizedException('Invalid token payload');
      }
      const payload = decoded;
      const user = await this.usersService.findById(payload.id);
      if (!user) throw new UnauthorizedException('User not found');
      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  // Get user by ID
  async getUserById(id: string): Promise<Record<string, unknown>> {
    const user = await this.usersService.findById(id);
    if (!user) throw new UnauthorizedException('User not found');
    // remove sensitive fields if any (password)
    const userObject = user.toObject<Record<string, unknown>>();
    delete (userObject as { password?: unknown }).password;
    const safe = userObject;
    return safe;
  }
}
