import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User } from 'generated/prisma';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('friendship')
@ApiBearerAuth('access-token')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get()
  @ApiBody({
    schema: { type: 'object', properties: { friendId: { type: 'number' } } },
  })
  async getUsersByName(
    @Param('friendId') friendId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.requestFriend({
      friendId,
      userId: user.id,
    });
  }

  @Get('friends')
  @ApiBody({ schema: { type: 'object', properties: {} } })
  async getFriends(@CurrentUser() user: User) {
    return this.friendshipService.getFriends(user.id);
  }

  @Get('requests')
  @ApiBody({ schema: { type: 'object', properties: {} } })
  async getFriendRequests(@CurrentUser() user: User) {
    return this.friendshipService.getPendingRequests(user.id);
  }

  @Get('requests/accept/:friendshipId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { friendshipId: { type: 'number' } },
    },
  })
  async acceptFriendRequest(
    @Param('friendshipId') friendshipId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.acceptFriendRequest({
      friendshipId,
      user: user,
    });
  }

  @Get('requests/reject/:friendshipId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { friendshipId: { type: 'number' } },
    },
  })
  async rejectFriendRequest(
    @Param('friendshipId') friendshipId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.rejectFriendRequest({
      friendshipId,
      user: user,
    });
  }

  @Post('block/:friendId')
  @ApiBody({
    schema: { type: 'object', properties: { friendId: { type: 'number' } } },
  })
  async blockUser(
    @Param('friendId') friendId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.blockUser({
      friendId,
      user,
    });
  }

  @Post('unblock/:friendshipId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { friendshipId: { type: 'number' } },
    },
  })
  async unblockUser(
    @Param('friendshipId') friendId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.unblockUser({
      friendId,
      user: user,
    });
  }
}
