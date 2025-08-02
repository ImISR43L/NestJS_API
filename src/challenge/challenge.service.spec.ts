// src/challenge/challenge.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeService } from './challenge.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Challenge, UserChallenge } from '@prisma/client';

const mockPrisma = {
  challenge: { findUnique: jest.fn() },
  userChallenge: { findUnique: jest.fn(), create: jest.fn() },
};

const mockChallenge: Challenge = {
  id: 'challenge-1',
  creatorId: 'user-1',
  title: 'Test Challenge',
  description: 'Desc',
  goal: 'Goal',
  isPublic: true,
  createdAt: new Date(),
};
const mockUserChallenge: UserChallenge = {
  id: 'user-challenge-1',
  userId: 'user-1',
  challengeId: 'challenge-1',
  progress: 0,
  completed: false,
  joinedAt: new Date(),
};

describe('ChallengeService', () => {
  let service: ChallengeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ChallengeService>(ChallengeService);
    jest.clearAllMocks();
  });

  describe('joinChallenge', () => {
    it('should throw ConflictException if user has already joined', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue(mockChallenge);
      // CORRECTED: Mock the findUnique method that the service now uses.
      mockPrisma.userChallenge.findUnique.mockResolvedValue(mockUserChallenge); // User already joined

      await expect(
        service.joinChallenge('challenge-1', 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
