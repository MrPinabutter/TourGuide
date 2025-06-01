import { Injectable } from '@nestjs/common';
import { Trip, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async getTrip(id: string): Promise<Trip | null> {
    return this.prisma.trip.findUnique({
      where: { id: +id },
    });
  }

  async getTrips(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }): Promise<Trip[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.trip.findMany({ skip, take, cursor, where, orderBy });
  }

  async createTrip(data: Prisma.TripCreateInput): Promise<Trip> {
    return this.prisma.trip.create({ data });
  }

  async updateTrip(params: {
    id: number;
    data: Prisma.TripUpdateInput;
    user: { id: number; role: string };
  }): Promise<Trip> {
    const { id, data, user } = params;

    const tripMember = await this.prisma.tripMember.findFirst({
      where: {
        tripId: id,
        userId: params.user.id,
      },
    });

    const isSuperAdmin = user?.role === 'ADMIN';

    if (!tripMember && !isSuperAdmin) {
      throw new Error('You are not a member of this trip');
    }

    if (!['CREATOR', 'ADMIN'].includes(tripMember.role) && !isSuperAdmin) {
      throw new Error('You do not have permission to update this trip');
    }

    return this.prisma.trip.update({ where: { id }, data });
  }

  async deleteTrip({
    id,
    user,
  }: {
    id: number;
    user: { id: number; role: string };
  }): Promise<Trip> {
    const tripMember = await this.prisma.tripMember.findFirst({
      where: {
        tripId: id,
        userId: user.id,
      },
    });

    const isSuperAdmin = user.role === 'ADMIN';

    if (!tripMember && !isSuperAdmin) {
      throw new Error('You are not a member of this trip');
    }

    if (!['CREATOR'].includes(tripMember.role) && !isSuperAdmin) {
      throw new Error('You do not have permission to delete this trip');
    }

    return this.prisma.trip.delete({
      where: { id: +id },
    });
  }
}
