// src/habit/habit.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HabitController } from './habit.controller';
import { HabitService } from './habit.service';
import { Request } from 'express';
import { CreateHabitDto } from './dto/habit.dto';

// Mock the HabitService
const mockHabitService = {
  create: jest.fn(),
  findAllForUser: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  logHabit: jest.fn(),
};

// Mock the user object attached by AuthGuard
const mockUser = { id: 'user-1', email: 'a@a.com', username: 'a' };
const mockRequest = { user: mockUser } as unknown as Request;

describe('HabitController', () => {
  let controller: HabitController;
  let service: HabitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitController],
      providers: [{ provide: HabitService, useValue: mockHabitService }],
    }).compile();

    controller = module.get<HabitController>(HabitController);
    service = module.get<HabitService>(HabitService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call habitService.create with correct user id and DTO', async () => {
      const createHabitDto: CreateHabitDto = { title: 'New Habit' };
      mockHabitService.create.mockResolvedValue({
        id: '1',
        ...createHabitDto,
        userId: mockUser.id,
      });

      await controller.create(createHabitDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createHabitDto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should call habitService.findAllForUser with correct user id', async () => {
      await controller.findAll(mockRequest);
      expect(service.findAllForUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('logHabit', () => {
    it('should call habitService.logHabit with correct parameters', async () => {
      const habitId = 'habit-123';
      const logDto = { completed: true };

      await controller.logHabit(habitId, logDto, mockRequest);

      expect(service.logHabit).toHaveBeenCalledWith(
        habitId,
        logDto,
        mockUser.id,
      );
    });
  });
});
