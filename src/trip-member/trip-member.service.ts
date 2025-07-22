import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TripMemberService {
  constructor(private prisma: PrismaService) {}

  async nada(): Promise<void> {
    console.log('Bleh');
  }
}
