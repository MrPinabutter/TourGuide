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
      where,
      orderBy,
    });
  }

  async findOne(id: number) {
    return this.prisma.step.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
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
}
