import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from 'generated/prisma';
import { CreateStepDto, UpdateStepDto } from './dto';
import { validateTripMemberPermissions } from 'src/utils/validation';

@Injectable()
export class StepService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ step, user }: { step: CreateStepDto; user: User }) {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: +step.tripId,
        TripMember: {
          some: {
            userId: user.id,
            role: {
              in: ['ADMIN', 'CREATOR'],
            },
          },
        },
      },
      include: {
        steps: true,
      },
    });

    if (!trip)
      throw new UnauthorizedException(
        "You don't have permission to create a new step in this trip",
      );

    const stepOrder = trip.steps.sort((a, b) => a.order - b.order);
    stepOrder.splice(step.order, 0, null);

    return this.prisma.$transaction([
      ...stepOrder
        .map((it, idx) => ({ ...it, order: idx }))
        .filter((it) => it.id !== undefined)
        .map((it) =>
          this.prisma.step.update({
            where: { id: it.id },
            data: {
              order: it.order,
            },
          }),
        ),
      this.prisma.step.create({
        data: { ...step, creatorId: user.id },
      }),
    ]);
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
      },
      include: { TripMember: true, steps: true },
    });

    if (
      validateTripMemberPermissions(
        user,
        trip.TripMember.find((it) => it.userId === user.id),
      )
    )
      if (!trip) throw new NotFoundException('Trip not found');

    const updateQuery = this.prisma.step.update({
      where: { id },
      data: step,
    });

    if (step.order === undefined || step.order === null) return updateQuery;

    const stepOrder: { order: number; id: number }[] = trip.steps
      .filter((it) => it.id !== id)
      .sort((a, b) => a.order - b.order);

    stepOrder.splice(step.order, 0, { id, order: step.order });

    return this.prisma.$transaction([
      ...stepOrder.map((it, idx) =>
        this.prisma.step.update({
          where: { id: it.id },
          data: {
            order: idx,
          },
        }),
      ),
      updateQuery,
    ]);
  }

  async remove({ id, user }: { id: number; user: User }) {
    const step = await this.prisma.step.findUnique({
      where: {
        id,
      },
      include: {
        TripMember: true,
        Trip: {
          include: {
            steps: true,
            TripMember: true,
          },
        },
      },
    });

    if (!step) throw new NotFoundException('Step not found!');

    if (
      validateTripMemberPermissions(
        user,
        step.Trip.TripMember.find((it) => it.id === user.id),
      )
    )
      throw new UnauthorizedException(
        'You dont have permission to remove this step!',
      );

    return this.prisma.$transaction([
      this.prisma.step.delete({
        where: { id },
      }),
      ...step.Trip.steps
        .sort((a, b) => a.order - b.order)
        .filter((it) => it.id !== id)
        .map((it, idx) =>
          this.prisma.step.update({
            where: {
              id: it.id,
            },
            data: {
              order: idx,
            },
          }),
        ),
    ]);
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
