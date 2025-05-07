import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'generated/prisma';

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

  async update(id: number, step: Prisma.StepUpdateInput) {
    return this.prisma.step.update({
      where: { id },
      data: step,
    });
  }

  async remove(id: number) {
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
