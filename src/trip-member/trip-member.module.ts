import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { TripMemberController } from './trip-member.controller';
import { TripMemberService } from './trip-member.service';

@Module({
  imports: [PrismaModule],
  controllers: [TripMemberController],
  providers: [TripMemberService],
})
export class TripMemberModule {}
