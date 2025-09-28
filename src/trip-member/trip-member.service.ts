import { Injectable } from '@nestjs/common';
import { MemberRole, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TripMemberService {
  constructor(private prisma: PrismaService) {}

  async nada(): Promise<void> {
    console.log('Bleh');
  }

  async updateUserPermission({
    currentUser,
    tripId,
    permission,
    userId,
  }: {
    userId: number;
    tripId: number;
    permission: MemberRole;
    currentUser: User;
  }) {
    if (userId === currentUser.id) {
      throw new Error('You cannot change your own permissions');
    }

    return await this.prisma.tripMember.update({
      where: {
        userId_tripId: {
          userId: userId,
          tripId: tripId,
        },
      },
      data: {
        role: permission,
      },
    });
  }
}
