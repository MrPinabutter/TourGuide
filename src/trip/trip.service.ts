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
    where: Prisma.TripWhereUniqueInput;
    data: Prisma.TripUpdateInput;
  }): Promise<Trip> {
    const { where, data } = params;
    return this.prisma.trip.update({ where, data });
  }

  async deleteTrip(id: string): Promise<Trip> {
    return this.prisma.trip.delete({
      where: { id: +id },
    });
  }
}
