// src/pet/pet.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PetService } from './pet.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ItemType,
  Pet,
  PetItem,
  UserPetItem,
  EquipmentSlot,
} from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  pet: { findUnique: jest.fn(), update: jest.fn() },
  userPetItem: { findUnique: jest.fn() },
  equippedItem: { upsert: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  $transaction: jest
    .fn()
    .mockImplementation(async (callback) => await callback(mockPrisma)),
};

// CORRECTED: Mock Pet object now matches the updated schema
const mockPet: Pet = {
  id: 'pet-1',
  userId: 'user-1',
  name: 'Sparky',
  hunger: 80,
  happiness: 80,
  health: 100,
  energy: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockHatItem: PetItem = {
  id: 'item-hat',
  name: 'Top Hat',
  description: 'A fancy hat',
  type: ItemType.CUSTOMIZATION,
  cost: 100,
  statEffect: null,
  effectValue: null,
  isPremium: false,
  equipmentSlot: EquipmentSlot.HAT,
};
const mockUserHatItem: UserPetItem & { item: PetItem } = {
  id: 'user-pet-item-hat',
  userId: 'user-1',
  itemId: 'item-hat',
  quantity: 1,
  createdAt: new Date(),
  item: mockHatItem,
};

describe('PetService', () => {
  let service: PetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<PetService>(PetService);
    jest.clearAllMocks();
  });

  describe('equipItem', () => {
    it('should equip an item to the correct slot', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.userPetItem.findUnique.mockResolvedValue(mockUserHatItem);
      // Mock the getPetByUserId call that happens at the end
      jest.spyOn(service, 'getPetByUserId').mockResolvedValue(mockPet as any);

      await service.equipItem('user-1', 'user-pet-item-hat');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.equippedItem.upsert).toHaveBeenCalledWith({
        where: { petId_slot: { petId: mockPet.id, slot: EquipmentSlot.HAT } },
        update: { petItemId: mockHatItem.id },
        create: {
          petId: mockPet.id,
          petItemId: mockHatItem.id,
          slot: EquipmentSlot.HAT,
        },
      });
    });

    it('should throw BadRequestException for non-equippable items', async () => {
      const nonEquippableItem = {
        ...mockUserHatItem,
        item: { ...mockHatItem, type: ItemType.FOOD },
      };
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.userPetItem.findUnique.mockResolvedValue(nonEquippableItem);

      await expect(
        service.equipItem('user-1', 'user-pet-item-hat'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unequipItem', () => {
    it('should remove an item from an equipment slot', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.equippedItem.findUnique.mockResolvedValue({
        id: 'equipped-1',
        petId: mockPet.id,
        petItemId: mockHatItem.id,
        slot: EquipmentSlot.HAT,
      });
      jest.spyOn(service, 'getPetByUserId').mockResolvedValue(mockPet as any);

      await service.unequipItem('user-1', EquipmentSlot.HAT);

      expect(mockPrisma.equippedItem.delete).toHaveBeenCalledWith({
        where: { petId_slot: { petId: mockPet.id, slot: EquipmentSlot.HAT } },
      });
    });

    it('should throw NotFoundException if no item is in the slot', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.equippedItem.findUnique.mockResolvedValue(null); // No item equipped

      await expect(
        service.unequipItem('user-1', EquipmentSlot.HAT),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
