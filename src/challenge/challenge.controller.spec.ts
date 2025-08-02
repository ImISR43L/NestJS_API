// src/challenge/challenge.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { Request } from 'express';

// Mock the ChallengeService
const mockChallengeService = {
  create: jest.fn(),
  findAllPublic: jest.fn(),
  findOne: jest.fn(),
  joinChallenge: jest.fn(),
  findUserChallenges: jest.fn(),
  updateUserChallengeProgress: jest.fn(),
  leaveChallenge: jest.fn(), // This line was missing
};

// Mock user and request objects
const mockUser = { id: 'user-1' };
const mockRequest = { user: mockUser } as unknown as Request;

describe('ChallengeController', () => {
  let controller: ChallengeController;
  let service: ChallengeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengeController],
      providers: [
        { provide: ChallengeService, useValue: mockChallengeService },
      ],
    }).compile();

    controller = module.get<ChallengeController>(ChallengeController);
    service = module.get<ChallengeService>(ChallengeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call challengeService.create with correct user id and DTO', async () => {
      const createDto = {
        title: 'New Challenge',
        description: 'Desc',
        goal: 'Goal',
      };
      await controller.create(createDto, mockRequest);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
    });
  });

  describe('joinChallenge', () => {
    it('should call challengeService.joinChallenge with correct id and user id', async () => {
      const challengeId = 'challenge-123';
      await controller.joinChallenge(challengeId, mockRequest);
      expect(service.joinChallenge).toHaveBeenCalledWith(
        challengeId,
        mockUser.id,
      );
    });
  });

  describe('updateProgress', () => {
    it('should call challengeService.updateUserChallengeProgress with correct params', async () => {
      const userChallengeId = 'uc-123';
      const updateDto = { progress: 75 };
      await controller.updateProgress(userChallengeId, updateDto, mockRequest);
      expect(service.updateUserChallengeProgress).toHaveBeenCalledWith(
        userChallengeId,
        75,
        mockUser.id,
      );
    });
  });

  describe('leaveChallenge', () => {
    it('should call challengeService.leaveChallenge with correct id and user id', async () => {
      const userChallengeId = 'uc-123';
      await controller.leaveChallenge(userChallengeId, mockRequest);
      expect(service.leaveChallenge).toHaveBeenCalledWith(
        userChallengeId,
        mockUser.id,
      );
    });
  });
});
