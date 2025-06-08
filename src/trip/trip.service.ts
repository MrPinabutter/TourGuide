import { Injectable } from '@nestjs/common';
import { Trip, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateTripDto } from './dto/trip';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async getTrip(id: string): Promise<Trip | null> {
    return this.prisma.trip.findUnique({
      where: { id: +id },
    });
  }

  async getMyTrips(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
    user?: { id: number; role: string };
  }): Promise<Trip[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const whereCondition: Prisma.TripWhereInput = {
      ...where,
      TripMember: {
        some: {
          userId: params.user?.id,
          role: {
            in: ['CREATOR', 'ADMIN', 'MEMBER'],
          },
        },
      },
    };

    return this.prisma.trip.findMany({
      skip,
      take,
      cursor,
      where: whereCondition,
      orderBy,
      include: {
        TripMember: true,
        steps: true,
      },
    });
  }

  async getPublicTrips(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }): Promise<Trip[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const publicWhere: Prisma.TripWhereInput = {
      ...where,
      visibility: 'PUBLIC',
      AND: [
        {
          TripMember: {
            some: { role: { in: ['CREATOR'] } },
          },
        },
        { visibility: 'FRIENDS_ONLY' },
      ],
    };

    return this.prisma.trip.findMany({
      skip,
      take,
      cursor,
      where: publicWhere,
      orderBy,
    });
  }

  async createTrip({
    data,
    user,
  }: {
    data: CreateTripDto;
    user: { id: number | string; role: string };
  }): Promise<Trip> {
    const newTrip = {
      name: data.name,
      coverPhoto: data.coverPhoto,
      description: data.description,
      steps: {
        create:
          data.steps?.map((step) => ({
            name: step.name,
            description: step.description,
            order: step.order,
            startDateTime: step.startDateTime,
            endDateTime: step.endDateTime,
            creator: {
              connect: {
                id: user.id,
              },
            },
            latitude: step.latitude,
            longitude: step.longitude,
          })) || [],
      },
      visibility: data.visibility || 'PUBLIC',
      TripMember: {
        create: {
          userId: user.id,
          role: 'CREATOR',
        },
      },
    } as Prisma.TripCreateInput;

    return this.prisma.trip.create({
      data: newTrip,
      include: {
        TripMember: true,
        steps: true,
      },
    });
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
