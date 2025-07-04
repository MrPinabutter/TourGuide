import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User, UserVisibility } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(user: User) {
    const freshUserData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
      },
    });

    return {
      ...freshUserData,
    };
  }

  async getUserById({ id, user }: { id: number; user: { id: number } }) {
    const requestedUser = await this.prisma.user.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        name: true,
        username: true,
        visibility: true,
        email: true,
      },
    });

    if (!user)
      throw new UnauthorizedException(
        'You do not have permission to delete this user',
      );

    const friendShip = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: id, friendId: user.id },
          { userId: user.id, friendId: id },
        ],
      },
    });

    if (requestedUser.visibility === 'PRIVATE') {
      if (!friendShip) {
        throw new NotFoundException('This account is private');
      }
    }
    const tripsOfThisUser = await this.prisma.trip.findMany({
      where: {
        visibility: {
          in: [...(friendShip ? ['FRIENDS_ONLY' as const] : []), 'PUBLIC'],
        },
      },
      select: {
        name: true,
        steps: true,
        description: true,
        id: true,
        coverPhoto: true,
        likes: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return { ...user, trips: tripsOfThisUser };
  }

  async getAllUsers({
    skip,
    take,
    cursor,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where: {
        ...where,
        visibility: 'PUBLIC',
        isActive: true,
      },
      orderBy,
      select: {},
    });
  }

  async getUsersByName(name: string) {
    return this.prisma.user.findMany({
      where: {
        visibility: 'PUBLIC',
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async createUser(user: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: user,
    });
  }

  async updateUser({
    id,
    data,
    user,
  }: {
    id: number;
    data: { name: string; username: string; visibility: UserVisibility };
    user: { role: string; id: number };
  }) {
    if (id !== user.id && user.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You do not have permission to update this user',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser({
    id,
    user,
  }: {
    id: number;
    user: { role: string; id: number };
  }) {
    if (id !== user.id && user.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You do not have permission to delete this user',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUserEmail(id: number, email: string) {
    return this.prisma.user.update({
      where: { id },
      data: { email },
    });
  }
}
