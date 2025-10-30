import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'generated/prisma';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import {
  AuthResponseDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    return;
  }

  @Get('google-redirect')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthResponseDto,
  })
  async googleAuthCallback(
    @Req() req,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ): Promise<AuthResponseDto> {
    return await this.authService.loginWithGoogle(
      req.user,
      userAgent,
      ipAddress,
    );
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    delete user.password;

    return user;
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto, userAgent, ipAddress);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto, userAgent, ipAddress);
  }

  @Post('validate-username')
  @Public()
  @ApiOperation({ summary: 'Check if username is available' })
  @ApiResponse({ status: 200, description: 'Username availability checked' })
  @ApiBody({
    description: 'Username to validate',
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
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ): Promise<AuthResponseDto> {
    return await this.authService.refresh(
      refreshTokenDto.refreshToken,
      userAgent,
      ipAddress,
    );
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiBody({
    description: 'Refresh token to revoke',
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'Refresh token to revoke',
        },
      },
      required: ['refreshToken'],
    },
  })
  async logout(
    @Body() body: { refreshToken: string },
  ): Promise<{ message: string }> {
    return await this.authService.logout(body.refreshToken);
  }

  @Post('logout-all')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out from all devices',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@CurrentUser() user: User): Promise<{ message: string }> {
    return await this.authService.logoutAll(user.id);
  }

  @Delete('user/me')
  @ApiBearerAuth('access-token')
  async deleteCurrentUser(@CurrentUser() user: User) {
    return await this.authService.deleteUser(user.id);
  }
}
