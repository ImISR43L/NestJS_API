// src/pet/pet.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';
import { Request } from 'express';
import { EquipItemDto } from './dto/pet.dto';
import { EquipmentSlot } from '@prisma/client';

const mockPetService = {
  getPetByUserId: jest.fn(),
  updatePet: jest.fn(),
  getUserInventory: jest.fn(),
  getShopItems: jest.fn(),
  buyItem: jest.fn(),
  useItemOnPet: jest.fn(),
  equipItem: jest.fn(),
  unequipItem: jest.fn(),
};

const mockUser = { id: 'user-1' };
const mockRequest = { user: mockUser } as unknown as Request;

describe('PetController', () => {
  let controller: PetController;
  let service: PetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetController],
      providers: [{ provide: PetService, useValue: mockPetService }],
    }).compile();

    controller = module.get<PetController>(PetController);
    service = module.get<PetService>(PetService);
    jest.clearAllMocks();
  });

  describe('equipItem', () => {
    it('should call petService.equipItem with correct params', async () => {
      const equipDto: EquipItemDto = { userPetItemId: 'user-pet-item-123' };
      await controller.equipItem(equipDto, mockRequest);
      expect(service.equipItem).toHaveBeenCalledWith(
        mockUser.id,
        equipDto.userPetItemId,
      );
    });
  });

  describe('unequipItem', () => {
    it('should call petService.unequipItem with correct slot and user id', async () => {
      const slot = EquipmentSlot.HAT;
      await controller.unequipItem(slot, mockRequest);
      expect(service.unequipItem).toHaveBeenCalledWith(mockUser.id, slot);
    });
  });
});
