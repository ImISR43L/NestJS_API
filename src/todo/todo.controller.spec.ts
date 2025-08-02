// src/todo/todo.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Request } from 'express';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';

// Mock the TodoService
const mockTodoService = {
  create: jest.fn(),
  findAllForUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  complete: jest.fn(),
};

// Mock user and request objects
const mockUser = { id: 'user-1' };
const mockRequest = { user: mockUser } as unknown as Request;

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: mockTodoService }],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call todoService.create with correct user id and DTO', async () => {
      const createDto: CreateTodoDto = { title: 'New To-Do' };
      await controller.create(createDto, mockRequest);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should call todoService.findAllForUser with correct user id', async () => {
      await controller.findAll(mockRequest);
      expect(service.findAllForUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('update', () => {
    it('should call todoService.update with correct id, DTO, and user id', async () => {
      const todoId = 'todo-123';
      const updateDto: UpdateTodoDto = { completed: true };
      await controller.update(todoId, updateDto, mockRequest);
      expect(service.update).toHaveBeenCalledWith(
        todoId,
        updateDto,
        mockUser.id,
      );
    });
  });

  describe('complete', () => {
    it('should call todoService.complete with correct id and user id', async () => {
      const todoId = 'todo-123';
      await controller.complete(todoId, mockRequest);
      expect(service.complete).toHaveBeenCalledWith(todoId, mockUser.id);
    });
  });
});
