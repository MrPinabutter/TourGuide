import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User } from 'generated/prisma';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TripMemberService } from './trip-member.service';

@Controller('trip-member')
@ApiBearerAuth('access-token')
export class TripMemberController {
  constructor(private readonly tripMemberService: TripMemberService) {}

  @Post()
  @ApiBody({
    description: 'Trip data to create',
    type: Object,
  })
  createTrip(@Body() body: any, @CurrentUser() user: User) {
    return this.tripMemberService.nada();
  }

  @Get(':id')
  async getTrip(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tripMemberService.nada();
  }
}
