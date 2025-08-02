// src/reward/reward.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Reward, User } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  reward: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: { findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest
    .fn()
    .mockImplementation(async (callback) => await callback(mockPrisma)),
};

const mockUser: User = {
  id: 'user-1',
  email: 'a@a.com',
  username: 'a',
  passwordHash: 'h',
  gold: 100,
  gems: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockReward: Reward = {
  id: 'reward-1',
  userId: 'user-1',
  title: 'Test Reward',
  notes: null,
  cost: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RewardService', () => {
  let service: RewardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<RewardService>(RewardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redeem', () => {
    beforeEach(() => {
      // Mock the findOne private method's dependency
      mockPrisma.reward.findUnique.mockResolvedValue(mockReward);
    });

    it('should allow a user to redeem a reward they can afford', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser); // User has 100 gold, cost is 50
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, gold: 50 });

      const result = await service.redeem('reward-1', 'user-1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { gold: { decrement: 50 } },
      });
      expect(result.message).toContain('Successfully redeemed');
      expect(result.newGoldBalance).toBe(50);
    });

    it('should throw ConflictException if user cannot afford the reward', async () => {
      const poorUser = { ...mockUser, gold: 20 }; // User has 20 gold, cost is 50
      mockPrisma.user.findUnique.mockResolvedValue(poorUser);

      await expect(service.redeem('reward-1', 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if the reward does not exist', async () => {
      mockPrisma.reward.findUnique.mockResolvedValue(null);
      await expect(
        service.redeem('non-existent-reward', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
