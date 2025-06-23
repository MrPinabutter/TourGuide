import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
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
      },
    });

    if (!user)
      throw new Error('You do not have permission to delete this user');

    if (requestedUser.visibility === 'PRIVATE') {
      const friendShip = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: id, friendId: user.id },
            { userId: user.id, friendId: id },
          ],
        },
      });

      if (!friendShip) {
        throw new Error('This account is private');
      }
    }

    return user;
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
      where,
      orderBy,
    });
  }

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

  async createUser(user: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: user,
    });
  }

  async updateUser({
    id,
    name,
    user,
  }: {
    id: number;
    name: string;
    user: { role: string; id: number };
  }) {
    if (id !== user.id && user.role !== 'ADMIN') {
      throw new Error('You do not have permission to update this user');
    }

    return this.prisma.user.update({
      where: { id },
      data: { name },
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
      throw new Error('You do not have permission to delete this user');
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
