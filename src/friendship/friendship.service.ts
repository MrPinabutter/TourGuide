import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService) {}

  async getFriends(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: 'ACCEPTED',
      },
      include: {
        user: true,
        friend: true,
      },
    });
  }

  async acceptFriendRequest({
    friendshipId,
    user,
  }: {
    friendshipId: number;
    user: User;
  }) {
    const friendship = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        receivedFriendRequests: {
          disconnect: { id: friendshipId },
        },
      },
    });

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

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        receivedFriendRequests: {
          disconnect: { id: friendshipId },
        },
      },
    });

    return friendship;
  }

  async removeFriend({ friendId, user }: { friendId: number; user: User }) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { friendId, userId: user.id },
          { friendId: user.id, userId: friendId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    if (friendship.userId !== user.id && friendship.friendId !== user.id) {
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

  async blockUser({
    friendId,
    user: { id: userId },
  }: {
    friendId: number;
    user: User;
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
      if (existingFriendship.status === 'BLOCKED') {
        throw new Error('User is already blocked');
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
    user: { id: userId },
  }: {
    friendId: number;
    user: User;
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
      throw new Error('No blocked friendship found');
    }

    return this.prisma.friendship.delete({
      where: { id: existingFriendship.id },
    });
  }
}
