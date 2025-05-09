import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripModule } from './trip/trip.module';
import { UserModule } from './user/user.module';
import { StepModule } from './step/step.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TripModule, UserModule, StepModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
