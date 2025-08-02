// imisr43l/nestjs-api-/NestJS-API--501253b249c59d74e46795b5a17fa508696fa3bb/src/challenge/dto/challenge.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateChallengeDto {
  @ApiProperty({ example: '30-Day Fitness Challenge' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Work out every day for 30 days.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Log 30 fitness activities.' })
  @IsString()
  @IsNotEmpty()
  goal: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  // --- ADD THIS ---
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class UpdateUserChallengeDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  progress: number;
}
