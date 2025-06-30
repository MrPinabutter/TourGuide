import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from 'generated/prisma';
import { UpdateStepDto } from './dto';

@Injectable()
export class StepService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StepCreateInput) {
    return this.prisma.step.create({
      data,
    });
  }

  async findAll({
    take = 0,
    skip = 10,
    cursor,
    where,
    orderBy,
  }: Prisma.StepFindManyArgs) {
    return this.prisma.step.findMany({
      take,
      skip,
      cursor,
      include: {
        _count: {
          select: {
            comments: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
      where,
      orderBy,
    });
  }

  async findOne(id: number) {
    const response = await this.prisma.step.findUnique({
      where: { id },
      include: {
        comments: true,
      },
    });

    return {
      ...response,
      comments: response.comments.map((it) =>
        it.isDeleted ? { ...it, text: '[DELETED]' } : it,
      ),
    };
  }

  async update({
    id,
    step,
    user,
  }: {
    id: number;
    step: UpdateStepDto;
    user: User;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: step.tripId,
        TripMember: {
          some: {
            userId: user.id,
          },
        },
      },
      include: { TripMember: true },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    return this.prisma.step.update({
      where: { id },
      data: step,
    });
  }

  async remove({ id, user }: { id: number; user: User }) {
    const step = await this.prisma.step.findUnique({
      where: {
        id,
        Trip: {
          TripMember: {
            some: {
              userId: user.id,
              role: {
                in: ['ADMIN', 'CREATOR'],
              },
            },
          },
        },
      },
    });

    if (!step)
      throw new UnauthorizedException(
        'You dont have permission to remove this step!',
      );

    return this.prisma.step.delete({
      where: { id },
    });
  }

  async addComment({ id, text }: { id: number; text: string }) {
    return this.prisma.comment.create({
      data: {
        text,
        user: {
          connect: {
            username: 'vitor', // get user from login
          },
        },
        step: {
          connect: { id },
        },
      },
    });
  }

  async updateComment({ id, text }: { id: number; text: string }) {
    return this.prisma.comment.update({
      where: { id },
      data: {
        text,
        isEdited: true,
      },
    });
  }

  async deleteComment(id: number) {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}
