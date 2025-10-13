import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async register(user: { email: string; username: string; password: string }) {
    const hashedPassword = await this.hashPassword(user.password);

    const newUser = await this.prismaService.user.create({
      data: {
        email: user.email,
        username: user.username,
        password: hashedPassword,
      },
    });
    return newUser;
  }

  async login(user: { username: string; password?: string }) {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: user.username }, { email: user.username }],
        isActive: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (existingUser.password) {
      const isPasswordValid = await bcrypt.compare(
        user.password,
        existingUser.password,
      );

      if (!isPasswordValid) {
        throw new NotFoundException('User not found');
      }
    }
    const payload = {
      sub: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async validateUser(userId: number) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
    });
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.prismaService.user.findUnique({
        where: { id: Number(decoded.sub) },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        username: user.username,
      };

      return {
        accessToken: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async deleteUser(userId: number) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }
}
