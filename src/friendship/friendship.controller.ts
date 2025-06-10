import { Controller, Get, Param, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly userService: FriendshipService) {}
  @Get()
  async getUsersByName(@Param('friendId') friendId: number, @Req() req) {
    return this.userService.requestFriend({ friendId, userId: req.user.id });
  }
}
