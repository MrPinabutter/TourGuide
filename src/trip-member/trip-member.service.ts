import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TripMemberService {
  constructor(private prisma: PrismaService) {}
  async validateUsersPermissions({ tripId, userId, currentUserId }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        TripMember: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const currentUser = trip.TripMember.find(
      (member) => member.userId === currentUserId,
    );

    if (!currentUser) {
      throw new NotFoundException('Current user not found in this trip');
    }

    const user = trip.TripMember.find((member) => member.userId === userId);

    if (!user) {
      throw new NotFoundException('User not found in this trip');
    }

    if (user.role === 'CREATOR') {
      throw new ForbiddenException(
        "You can't change the permissions of the trip creator",
      );
    }

    if (!['ADMIN', 'CREATOR'].includes(currentUser.role)) {
      throw new ForbiddenException(
        "You don't have permission to change user roles",
      );
    }
  }

  async getTripMembers(tripId: number) {
    return this.prisma.tripMember.findMany({
      where: { tripId },
      include: {
        user: true,
      },
    });
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
    await this.validateUsersPermissions({
      tripId,
      userId,
      currentUserId: currentUser.id,
    });

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

  async removeUserFromTrip({
    currentUser,
    tripId,
    userId,
  }: {
    userId: number;
    tripId: number;
    currentUser: User;
  }) {
    await this.validateUsersPermissions({
      tripId,
      userId,
      currentUserId: currentUser.id,
    });

    return await this.prisma.tripMember.delete({
      where: {
        userId_tripId: {
          userId: userId,
          tripId: tripId,
        },
      },
    });
  }
}
