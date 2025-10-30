import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prismaService: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google-redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      name: { familyName: string; givenName: string };
      emails: Array<{ value: string; verified: boolean }>;
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;

    const email = emails[0].value;

    let user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      const counter = await this.prismaService.user.count({
        where: { username },
      });

      username = `${baseUsername}${counter || ''}`;

      user = await this.prismaService.user.create({
        data: {
          email,
          name: `${name.givenName}${
            name.familyName ? ` ${name.familyName}` : ''
          }`,
          username,
          googleId: profile.id,
        },
      });
    } else {
      if (!user.googleId) {
        user = await this.prismaService.user.update({
          where: { email },
          data: {
            googleId: profile.id,
          },
        });
      }
    }

    done(null, user);
  }
}
