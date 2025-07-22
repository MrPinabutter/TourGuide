import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MemberRole } from 'generated/prisma';
import { CreateStepDto } from 'src/step/dto';

export enum TripVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
}

export class CreateTripMemberDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Member role' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateTripDto {
  @ApiProperty({
    description: 'Trip name',
    example: 'Summer Adventure in Europe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Cover photo URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  coverPhoto?: string;

  @ApiPropertyOptional({
    description: 'Trip description',
    example: 'A wonderful journey through European cities',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Creation date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'Last update date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  @ApiPropertyOptional({
    description: 'Trip visibility',
    enum: TripVisibility,
    default: TripVisibility.PRIVATE,
  })
  @IsOptional()
  @IsEnum(TripVisibility)
  visibility?: TripVisibility;

  @ApiPropertyOptional({
    description: 'Trip steps',
    type: [CreateStepDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps?: CreateStepDto[];
}

export class UpdateTripDto {
  @ApiProperty({
    description: 'Trip name',
    example: 'Summer Adventure in Europe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Cover photo URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  coverPhoto?: string;

  @ApiPropertyOptional({
    description: 'Trip description',
    example: 'A wonderful journey through European cities',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Trip visibility',
    enum: TripVisibility,
    default: TripVisibility.PRIVATE,
  })
  @IsOptional()
  @IsEnum(TripVisibility, {
    message: `Visibility must be one of: ${Object.values(TripVisibility).join(
      ', ',
    )}`,
  })
  visibility?: TripVisibility;
}

export class UpdateTokenDto {
  @ApiPropertyOptional({
    description: 'Last update date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Invite Mode',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(MemberRole)
  inviteMode: MemberRole;
}
