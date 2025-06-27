import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    return;
  }

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req) {
    return await this.authService.login(req.user);
  }
}
