import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Trip, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateTripDto, UpdateTripDto } from './dto/trip';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async getTrip({
    id,
    user,
  }: {
    id: string;
    user: { id: number; role: string };
  }): Promise<Trip | null> {
    if (!id) {
      throw new Error('Trip ID is required');
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: +id },
      include: {
        TripMember: true,
        steps: true,
      },
    });

    if (!trip || trip.visibility === 'PRIVATE') {
      const tripMember = trip?.TripMember.find(
        (member) => member.userId === user.id,
      );

      if (!tripMember) {
        throw new NotFoundException('Trip not found');
      }
    }

    //TODO: handle friends-only visibility

    return trip;
  }

  async getMyTrips(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
    user: { id: number; role: string };
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
    };

    // TODO: handle friends-only visibility

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
    data: UpdateTripDto;
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
      throw new NotFoundException('Trip not found');
    }

    if (!['CREATOR', 'ADMIN'].includes(tripMember.role) && !isSuperAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this trip',
      );
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

    if (
      !tripMember &&
      !['ADMIN', 'CREATOR'].includes(tripMember?.role) &&
      !isSuperAdmin
    ) {
      throw new UnauthorizedException(
        'You do not have permission to delete this trip',
      );
    }

    return this.prisma.trip.delete({
      where: { id: +id },
    });
  }
}
