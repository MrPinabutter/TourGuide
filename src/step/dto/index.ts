import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStepDto {
  @ApiProperty({
    description: 'Step name',
    example: 'Visit Eiffel Tower',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Step description',
    example: 'Take photos and enjoy the view from the top',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Start date and time (ISO string)',
    example: '2024-06-15T09:00:00.000Z',
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    description: 'End date and time (ISO string)',
    example: '2024-06-15T12:00:00.000Z',
  })
  @IsDateString()
  endDateTime: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 48.8584,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90)
  @Max(90)
  @Transform(({ value }) => parseFloat(value))
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 2.2945,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @ApiProperty({
    description: 'Step order in the trip',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  order: number;

  @ApiProperty({
    description: 'Trip ID this step belongs to',
    example: 123,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  tripId: number;
}

export class UpdateStepDto {
  @ApiProperty({
    description: 'Step name',
    example: 'Visit Eiffel Tower',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Step description',
    example: 'Take photos and enjoy the view from the top',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Start date and time (ISO string)',
    example: '2024-06-15T09:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDateTime: string;

  @ApiProperty({
    description: 'End date and time (ISO string)',
    example: '2024-06-15T12:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDateTime: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 48.8584,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsOptional()
  @Min(-90)
  @Max(90)
  @Transform(({ value }) => parseFloat(value))
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 2.2945,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @ApiProperty({
    description: 'Step order in the trip',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  order: number;

  @ApiProperty({
    description: 'Trip ID this step belongs to',
    example: 123,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  tripId: number;
}
