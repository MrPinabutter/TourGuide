import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { Prisma } from 'generated/prisma';
import { ApiBody } from '@nestjs/swagger';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}
  @Get(':id')
  async getTrip(@Param('id') id: string) {
    return this.tripService.getTrip(id);
  }

  @Get()
  async getTrips(
    @Query('orderBy') orderBy = 'createdAt',
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.tripService.getTrips({
      orderBy: { [orderBy]: 'desc' },
      skip,
      take,
    });
  }

  @Post()
  @ApiBody({
    description: 'Trip data to create',
    type: Object,
  })
  createTrip(@Body() body: Prisma.TripCreateInput) {
    return this.tripService.createTrip(body);
  }

  @Delete(':id')
  deleteTrip(@Param('id') id: string) {
    return this.tripService.deleteTrip(id);
  }
}
