import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { AuthTokenPayload } from './types';
// import { ChangePasswordDto } from './dto/change-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
    @Req()
    req: Request & {
      user?: AuthTokenPayload;
    },
  ): Promise<Record<string, unknown>> {
    // JwtAuthGuard already populated req.user when token is valid
    const payload = req.user;
    if (!payload) {
      throw new UnauthorizedException('Missing authentication payload');
    }
    // Return the full user from DB to avoid leaking password/hash etc.
    return this.authService.getUserById(payload.id);
  }
}
