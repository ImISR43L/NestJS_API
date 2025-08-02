// src/pet/dto/pet.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdatePetDto {
  @ApiProperty({ example: 'Sparky', description: 'The new name for your pet' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UseItemDto {
  @ApiProperty({
    description:
      'The ID of the consumable item from your inventory (UserPetItem ID)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userPetItemId: string;
}

export class EquipItemDto {
  @ApiProperty({
    description:
      'The ID of the CUSTOMIZATION item from your inventory (UserPetItem ID)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userPetItemId: string;
}
