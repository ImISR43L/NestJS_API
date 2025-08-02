// src/daily/daily.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DailyService } from './daily.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Daily, Difficulty, User } from '@prisma/client';
import { subDays } from 'date-fns';

// Mock Prisma client
const mockPrisma = {
  daily: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  user: { update: jest.fn() },
  pet: { update: jest.fn() },
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
const mockDaily: Daily = {
  id: 'daily-1',
  userId: 'user-1',
  title: 'test daily',
  notes: null,
  completed: false,
  difficulty: Difficulty.MEDIUM,
  lastCompleted: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DailyService', () => {
  let service: DailyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DailyService>(DailyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForUser', () => {
    it('should return dailies and reset completed status for old completions', async () => {
      const yesterday = subDays(new Date(), 1);
      const dailiesFromDb = [
        {
          ...mockDaily,
          id: 'daily-1',
          completed: true,
          lastCompleted: yesterday,
        }, // Should be reset
        { ...mockDaily, id: 'daily-2', completed: false, lastCompleted: null }, // Should stay as is
        {
          ...mockDaily,
          id: 'daily-3',
          completed: true,
          lastCompleted: new Date(),
        }, // Should stay completed
      ];
      mockPrisma.daily.findMany.mockResolvedValue(dailiesFromDb);

      const result = await service.findAllForUser('user-1');

      expect(result[0].completed).toBe(false); // Was reset
      expect(result[1].completed).toBe(false);
      expect(result[2].completed).toBe(true);
    });
  });

  describe('complete', () => {
    it('should complete a daily, update user gold, and pet happiness', async () => {
      mockPrisma.daily.findUnique.mockResolvedValue(mockDaily);

      await service.complete('daily-1', 'user-1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // Medium difficulty reward for dailies
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { gold: { increment: 12 } },
      });
      expect(mockPrisma.pet.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { happiness: { increment: 5 } },
      });
      expect(mockPrisma.daily.update).toHaveBeenCalledWith({
        where: { id: 'daily-1' },
        data: { completed: true, lastCompleted: expect.any(Date) },
      });
    });

    it('should throw ConflictException if daily is already completed today', async () => {
      const alreadyCompletedDaily = { ...mockDaily, lastCompleted: new Date() };
      mockPrisma.daily.findUnique.mockResolvedValue(alreadyCompletedDaily);

      await expect(service.complete('daily-1', 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
