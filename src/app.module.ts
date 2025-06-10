import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripModule } from './trip/trip.module';
import { UserModule } from './user/user.module';
import { StepModule } from './step/step.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { FriendshipModule } from './friendship/friendship.module';

@Module({
  imports: [TripModule, UserModule, StepModule, FriendshipModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
