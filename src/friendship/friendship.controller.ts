import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'generated/prisma';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { FriendshipService } from './friendship.service';

@Controller('friendship')
@ApiBearerAuth('access-token')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}
  @Get('friends')
  async getFriends(@CurrentUser() user: User) {
    return this.friendshipService.getFriends(user.id);
  }

  @Get('requests')
  async getFriendRequests(@CurrentUser() user: User) {
    return this.friendshipService.getPendingRequests(user.id);
  }

  @Post('request/:friendId')
  async sendFriendRequest(
    @Param('friendId') friendId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.sendFriendRequest({
      friendId,
      userId: user.id,
    });
  }

  @Post('requests/accept/:friendshipId')
  async acceptFriendRequest(
    @Param('friendshipId') friendshipId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.acceptFriendRequest({
      friendshipId,
      user: user,
    });
  }

  @Post('requests/reject/:friendshipId')
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
  async blockUser(
    @Param('friendId') friendId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.blockUser({
      friendId,
      userId: user.id,
    });
  }

  @Post('unblock/:friendId')
  async unblockUser(
    @Param('friendId') friendId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.unblockUser({
      friendId,
      userId: user.id,
    });
  }

  @Delete('remove/:friendId')
  async removeFriend(
    @Param('friendId') friendId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendshipService.removeFriend({
      friendId,
      userId: user.id,
    });
  }
}
