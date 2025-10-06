import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService) {}

  async getFriends(userId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: 'ACCEPTED',
      },
      select: {
        friend: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        userId: true,
        friendId: true,
        id: true,
      },
    });

    return friendships.map((friend) =>
      friend.userId === userId ? friend.friend : friend.user,
    );
  }

  async acceptFriendRequest({
    friendshipId,
    user,
  }: {
    friendshipId: number;
    user: User;
  }) {
    const friendship = await this.prisma.friendship.update({
      where: { id: friendshipId, friendId: user.id },
      data: { status: 'ACCEPTED' },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    return friendship;
  }

  async rejectFriendRequest({
    friendshipId,
    user,
  }: {
    friendshipId: number;
    user: User;
  }) {
    const friendship = await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    return friendship;
  }

  async removeFriend({
    friendId,
    userId,
  }: {
    friendId: number;
    userId: number;
  }) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { friendId, userId },
          { friendId: userId, userId: friendId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    if (friendship.userId !== userId && friendship.friendId !== userId) {
      throw new NotFoundException('You are not part of this friendship');
    }

    return this.prisma.friendship.delete({
      where: { id: friendship.id },
    });
  }

  async getPendingRequests(userId: number) {
    return this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        receivedFriendRequests: {
          where: { status: 'PENDING' },
          include: {
            user: true,
          },
        },
      },
    });
  }

  async sendFriendRequest({
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
        throw new BadRequestException('Friendship already exists');
      }

      if (
        existingFriendship.status === 'PENDING' &&
        existingFriendship.userId === userId
      ) {
        throw new BadRequestException('Friendship request already sent');
      }

      if (
        existingFriendship.status === 'PENDING' &&
        existingFriendship.friendId === userId
      ) {
        throw new BadRequestException('Accept the pending friendship request');
      }

      if (existingFriendship.status === 'BLOCKED') {
        throw new BadRequestException('Friendship is blocked');
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

  async blockUser({ friendId, userId }: { friendId: number; userId: number }) {
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { friendId, userId },
          { friendId: userId, userId: friendId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'BLOCKED') {
        throw new BadRequestException('User is already blocked');
      }

      return this.prisma.friendship.update({
        where: { id: existingFriendship.id },
        data: { status: 'BLOCKED', blockedBy: userId },
      });
    }

    return this.prisma.friendship.create({
      data: {
        friendId,
        userId,
        status: 'BLOCKED',
        blockedBy: userId,
      },
    });
  }

  async unblockUser({
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
        status: 'BLOCKED',
        blockedBy: userId,
      },
    });

    if (!existingFriendship) {
      throw new NotFoundException('No blocked friendship found');
    }

    return this.prisma.friendship.delete({
      where: { id: existingFriendship.id },
    });
  }
}
