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

  @Post('permission')
  @ApiBody({
    description: 'Update user permission',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        tripId: { type: 'number' },
        permission: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
      },
    },
  })
  async updateUserPermission(
    @Body()
    body: {
      userId: number;
      tripId: number;
      permission: 'ADMIN' | 'MEMBER';
    },
    @CurrentUser() user: User,
  ) {
    return this.tripMemberService.updateUserPermission({
      currentUser: user,
      tripId: body.tripId,
      permission: body.permission,
      userId: body.userId,
    });
  }
}
