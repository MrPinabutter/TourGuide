import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService) {}

  async getUsersByName(name: string) {
    return this.prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async requestFriend({
    friendId,
    userId,
  }: {
    friendId: number;
    userId: number;
  }) {
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { friendId, userId },
          { friendId: userId, userId: friendId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'ACCEPTED') {
        throw new Error('Friendship already exists');
      }

      if (existingFriendship.status === 'PENDING') {
        throw new Error('Friendship request already sent');
      }

      if (existingFriendship.status === 'BLOCKED') {
        throw new Error('Friendship is blocked');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      const newFriendship = await prisma.friendship.create({
        data: {
          friendId,
          userId,
          status: 'PENDING',
        },
      });

      const friendUser = await prisma.user.update({
        where: { id: friendId },
        data: {
          receivedFriendRequests: {
            connect: { id: newFriendship.id },
          },
        },
      });

      if (!friendUser) {
        throw new Error('Friend not found');
      }
    });
  }
}
