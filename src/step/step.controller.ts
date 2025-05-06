import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { StepService } from './step.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  @ApiBody({
    description: 'Step data to create',
    type: Object,
  })
  create(@Body() body: Prisma.StepCreateInput) {
    return this.stepService.create(body);
  }

  @Get()
  findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @Query('cursor') cursor: Prisma.StepWhereUniqueInput,
    @Query('where') where: Prisma.StepWhereInput,
    @Query('orderBy') orderBy: Prisma.StepOrderByWithRelationInput,
  ) {
    return this.stepService.findAll({
      skip: Number(skip),
      take: Number(take),
      cursor,
      where,
      orderBy,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stepService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({
    description: 'Step data to create',
    type: Object,
  })
  update(@Param('id') id: string, @Body() body: Prisma.StepUpdateInput) {
    return this.stepService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stepService.remove(+id);
  }
}
