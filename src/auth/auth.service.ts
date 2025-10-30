import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  async register(
    registerDto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    if (registerDto.password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (
      !/[A-Z]/.test(registerDto.password) ||
      !/[a-z]/.test(registerDto.password) ||
      !/[0-9]/.test(registerDto.password)
    ) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase letters, and numbers',
      );
    }

    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { username: registerDto.username }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already in use');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const newUser = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
      },
    });

    return await this.generateTokens(newUser.id, userAgent, ipAddress);
  }

  async validateUsername(username: string) {
    const user = await this.prismaService.user.findFirst({
      where: { username: username },
    });
    return { available: !user };
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: loginDto.username }, { email: loginDto.username }],
        isActive: true,
      },
    });

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!existingUser.password) {
      throw new UnauthorizedException(
        'This account uses OAuth. Please login with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateTokens(existingUser.id, userAgent, ipAddress);
  }

  async loginWithGoogle(
    googleUser: { id: string; email: string; name: string },
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    let user = await this.prismaService.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      user = await this.prismaService.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        user = await this.prismaService.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id },
        });
      } else {
        user = await this.prismaService.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.id,
            username: googleUser.email.split('@')[0] + '_' + Date.now(),
          },
        });
      }
    }

    return await this.generateTokens(user.id, userAgent, ipAddress);
  }

  async validateUser(userId: number) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
    });
  }

  async generateTokens(
    userId: number,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessTokenExpiry =
      this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const refreshTokenExpiry =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiry,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenRecord = await this.prismaService.refreshToken.create({
      data: {
        token: '',
        userId: user.id,
        expiresAt,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
      },
    });

    const refreshPayload = {
      sub: user.id,
      tokenId: refreshTokenRecord.id,
      type: 'refresh',
    };

    const refreshTokenValue = this.jwtService.sign(refreshPayload, {
      secret:
        this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
        this.configService.get<string>('JWT_SECRET'),
      expiresIn: refreshTokenExpiry,
    });

    const hashedRefreshToken = await this.hashPassword(refreshTokenValue);

    await this.prismaService.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { token: hashedRefreshToken },
    });

    await this.prismaService.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiryToSeconds(accessTokenExpiry),
    };
  }

  async refresh(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!decoded.tokenId || !decoded.sub || decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    const tokenRecord = await this.prismaService.refreshToken.findUnique({
      where: { id: decoded.tokenId },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!tokenRecord || tokenRecord.userId !== decoded.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isValid = await bcrypt.compare(refreshToken, tokenRecord.token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prismaService.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    return await this.generateTokens(tokenRecord.userId, userAgent, ipAddress);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });

      if (decoded.tokenId) {
        await this.prismaService.refreshToken.updateMany({
          where: {
            id: decoded.tokenId,
            isRevoked: false,
          },
          data: { isRevoked: true },
        });
      }
    } catch (error) {}

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: number): Promise<{ message: string }> {
    await this.prismaService.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    return { message: 'Logged out from all devices successfully' };
  }

  private parseExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  async deleteUser(userId: number) {
    await this.prismaService.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}
