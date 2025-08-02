// src/reward/reward.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { Request } from 'express';
import { CreateRewardDto } from './dto/reward.dto';

// Mock the RewardService
const mockRewardService = {
  create: jest.fn(),
  findAllForUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  redeem: jest.fn(),
};

// Mock user and request objects
const mockUser = { id: 'user-1' };
const mockRequest = { user: mockUser } as unknown as Request;

describe('RewardController', () => {
  let controller: RewardController;
  let service: RewardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [{ provide: RewardService, useValue: mockRewardService }],
    }).compile();

    controller = module.get<RewardController>(RewardController);
    service = module.get<RewardService>(RewardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call rewardService.create with correct user id and DTO', async () => {
      const createDto: CreateRewardDto = { title: 'New Reward', cost: 100 };
      await controller.create(createDto, mockRequest);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should call rewardService.findAllForUser with correct user id', async () => {
      await controller.findAll(mockRequest);
      expect(service.findAllForUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('redeem', () => {
    it('should call rewardService.redeem with correct reward id and user id', async () => {
      const rewardId = 'reward-123';
      await controller.redeem(rewardId, mockRequest);
      expect(service.redeem).toHaveBeenCalledWith(rewardId, mockUser.id);
    });
  });
});
