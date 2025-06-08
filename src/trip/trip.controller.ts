import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { Prisma } from 'generated/prisma';
import { ApiBody } from '@nestjs/swagger';
import { CreateTripDto } from './dto/trip';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}
  @Get(':id')
  async getTrip(@Param('id') id: string) {
    return this.tripService.getTrip(id);
  }

  @Get()
  async getMyTrips(
    @Query('orderBy') orderBy = 'createdAt',
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.tripService.getMyTrips({
      orderBy: { [orderBy]: 'desc' },
      skip,
      take,
    });
  }

  @Get('public')
  async getPublicTrips(
    @Query('orderBy') orderBy = 'createdAt',
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.tripService.getPublicTrips({
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
  createTrip(@Body() body: CreateTripDto, @Req() req) {
    return this.tripService.createTrip({ data: body, user: req.user });
  }

  @Delete(':id')
  deleteTrip(@Param('id') id: number, @Req() req) {
    return this.tripService.deleteTrip({ id, user: req.user });
  }

  @Put(':id')
  @ApiBody({
    description: 'Trip data to update',
    type: Object,
  })
  updateTrip(
    @Param('id') id: number,
    @Body() data: Prisma.TripUpdateInput,
    @Req() req,
  ) {
    return this.tripService.updateTrip({ id, data, user: req.user });
  }
}
