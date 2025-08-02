// src/todo/todo.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Difficulty, Todo } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  todo: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: { update: jest.fn() },
  pet: { update: jest.fn() },
  $transaction: jest
    .fn()
    .mockImplementation(async (callback) => await callback(mockPrisma)),
};

const mockTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  title: 'test todo',
  notes: null,
  completed: false,
  difficulty: Difficulty.HARD,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<TodoService>(TodoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('complete', () => {
    beforeEach(() => {
      // Mock the findOne private method's dependency
      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo);
    });

    it('should complete a todo and grant rewards', async () => {
      await service.complete('todo-1', 'user-1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // Hard difficulty reward for todos
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { gold: { increment: 16 } },
      });
      expect(mockPrisma.pet.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { happiness: { increment: 5 } },
      });
      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: { completed: true },
      });
    });

    it('should throw ConflictException if todo is already completed', async () => {
      const alreadyCompletedTodo = { ...mockTodo, completed: true };
      // Override the findUnique mock for this specific test
      mockPrisma.todo.findUnique.mockResolvedValue(alreadyCompletedTodo);

      await expect(service.complete('todo-1', 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if todo does not exist', async () => {
      mockPrisma.todo.findUnique.mockResolvedValue(null);

      await expect(
        service.complete('todo-nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should call prisma.todo.update with correct data', async () => {
      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo);
      const updateDto = { title: 'Updated Title' };

      await service.update('todo-1', updateDto, 'user-1');

      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: updateDto,
      });
    });
  });
});
