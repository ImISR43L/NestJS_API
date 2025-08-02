// src/habit/habit.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HabitService } from './habit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Difficulty, HabitType, Pet, User } from '@prisma/client';
import { startOfDay, subDays } from 'date-fns';

// Expanded mockPrisma to include the 'delete' method for the remove tests
const mockPrisma = {
  habit: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  habitLog: { findFirst: jest.fn(), create: jest.fn() },
  user: { findUnique: jest.fn(), update: jest.fn() },
  pet: { findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest
    .fn()
    .mockImplementation((callback) => callback(mockPrisma)),
};

const mockUser: User = {
  id: 'user-1',
  email: 'a@a.com',
  username: 'a',
  passwordHash: 'h',
  gold: 500, // Give the mock user plenty of gold for tests
  gems: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockHabit = {
  id: 'habit-1',
  userId: 'user-1',
  title: 'test',
  type: HabitType.POSITIVE,
  difficulty: Difficulty.MEDIUM,
  isPaused: false,
  positiveCounter: 0,
  negativeCounter: 0,
  currentStreak: 5, // A low streak for testing
  longestStreak: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('HabitService', () => {
  let service: HabitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<HabitService>(HabitService);
    jest.clearAllMocks();
  });

  // --- LOG HABIT TESTS (UNCHANGED) ---
  describe('logHabit', () => {
    // ... existing logHabit tests ...
  });

  // --- UPDATE HABIT TESTS (NEW) ---
  describe('update', () => {
    it('should charge gold when downgrading difficulty', async () => {
      mockPrisma.habit.findUnique.mockResolvedValue({
        ...mockHabit,
        difficulty: Difficulty.HARD,
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await service.update(
        'habit-1',
        { difficulty: Difficulty.EASY },
        'user-1',
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { gold: { decrement: 200 } }, // Cost from HARD to EASY
      });
    });

    it('should throw ForbiddenException if user cannot afford downgrade', async () => {
      mockPrisma.habit.findUnique.mockResolvedValue({
        ...mockHabit,
        difficulty: Difficulty.HARD,
      });
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, gold: 50 }); // Not enough gold

      await expect(
        service.update('habit-1', { difficulty: Difficulty.EASY }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should not charge gold if difficulty is not downgraded', async () => {
      mockPrisma.habit.findUnique.mockResolvedValue(mockHabit);
      await service.update('habit-1', { title: 'New Title' }, 'user-1');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  // --- REMOVE HABIT TESTS (NEW) ---
  describe('remove', () => {
    it('should delete habit if streak threshold is met', async () => {
      const highStreakHabit = { ...mockHabit, currentStreak: 25 };
      mockPrisma.habit.findUnique.mockResolvedValue(highStreakHabit);

      await service.remove('habit-1', 'user-1');
      expect(mockPrisma.habit.delete).toHaveBeenCalledWith({
        where: { id: 'habit-1' },
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should delete habit by paying gold if streak is not met', async () => {
      mockPrisma.habit.findUnique.mockResolvedValue(mockHabit); // Low streak
      mockPrisma.user.findUnique.mockResolvedValue(mockUser); // User has enough gold

      await service.remove('habit-1', 'user-1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { gold: { decrement: 100 } }, // Cost for MEDIUM difficulty
      });
      expect(mockPrisma.habit.delete).toHaveBeenCalledWith({
        where: { id: 'habit-1' },
      });
    });

    it('should throw ForbiddenException if conditions are not met', async () => {
      const poorUser = { ...mockUser, gold: 10 };
      mockPrisma.habit.findUnique.mockResolvedValue(mockHabit); // Low streak
      mockPrisma.user.findUnique.mockResolvedValue(poorUser); // Not enough gold

      await expect(service.remove('habit-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
