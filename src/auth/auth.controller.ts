import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'generated/prisma';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    return;
  }

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req) {
    return await this.authService.login(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post('register')
  @ApiBody({
    description: 'Register a new user',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        username: { type: 'string', example: 'username' },
        password: { type: 'string', example: 'password' },
      },
    },
  })
  async register(
    @Body() registerDto: { email: string; username: string; password: string },
  ) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @ApiBody({
    description: 'Login with username/email and password',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'username or email' },
        password: { type: 'string', example: 'password' },
      },
    },
  })
  async login(@Body() loginDto: { username: string; password?: string }) {
    return await this.authService.login(loginDto);
  }

  @Post('validate')
  @ApiBody({
    description: 'Validate user by ID',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
    },
  })
  async validate(@Body() validateDto: { id: number }) {
    return await this.authService.validateUser(validateDto.id);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.authService.refresh(body.refreshToken);
  }
}
