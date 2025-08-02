// src/daily/daily.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DailyController } from './daily.controller';
import { DailyService } from './daily.service';
import { Request } from 'express';

// Mock the DailyService
const mockDailyService = {
  create: jest.fn(),
  findAllForUser: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  complete: jest.fn(),
};

// Mock user and request objects
const mockUser = { id: 'user-1' };
const mockRequest = { user: mockUser } as unknown as Request;

describe('DailyController', () => {
  let controller: DailyController;
  let service: DailyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyController],
      providers: [{ provide: DailyService, useValue: mockDailyService }],
    }).compile();

    controller = module.get<DailyController>(DailyController);
    service = module.get<DailyService>(DailyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call dailyService.create with correct user id and DTO', async () => {
      const createDto = { title: 'New Daily' };
      await controller.create(createDto, mockRequest);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should call dailyService.findAllForUser with correct user id', async () => {
      await controller.findAll(mockRequest);
      expect(service.findAllForUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should call dailyService.findOne with correct id and user id', async () => {
      const dailyId = 'daily-123';
      await controller.findOne(dailyId, mockRequest);
      expect(service.findOne).toHaveBeenCalledWith(dailyId, mockUser.id);
    });
  });

  describe('complete', () => {
    it('should call dailyService.complete with correct id and user id', async () => {
      const dailyId = 'daily-123';
      await controller.complete(dailyId, mockRequest);
      expect(service.complete).toHaveBeenCalledWith(dailyId, mockUser.id);
    });
  });
});
