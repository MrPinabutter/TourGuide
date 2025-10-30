import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User } from 'generated/prisma';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    return;
  }

  @Get('google-redirect')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req) {
    return await this.authService.login(req.user);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  async getProfile(@CurrentUser() user: User) {
    delete user.password;
    delete user.refreshToken;

    return user;
  }

  @Post('register')
  @Public()
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
  @Public()
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
  @ApiBearerAuth('access-token')
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

  @Post('validate-username')
  @Public()
  @ApiBody({
    description: 'Validate username',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'username' },
      },
    },
  })
  async validateUsername(@Body() body: { username: string }) {
    return await this.authService.validateUsername(body.username);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.authService.refresh(body.refreshToken);
  }

  @Delete('user/me')
  @ApiBearerAuth('access-token')
  async deleteCurrentUser(@CurrentUser() user: User) {
    return await this.authService.deleteUser(user.id);
  }
}
