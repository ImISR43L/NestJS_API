// src/group/group.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Request } from 'express';

// Mock the GroupService
const mockGroupService = {
  create: jest.fn(),
  findAllPublic: jest.fn(),
  findOne: jest.fn(),
  findUserGroups: jest.fn(),
  update: jest.fn(),
  joinGroup: jest.fn(),
  leaveGroup: jest.fn(),
};

// Mock user and request objects
const mockUser = { id: 'user-1' };
const mockRequest = { user: mockUser } as unknown as Request;

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [{ provide: GroupService, useValue: mockGroupService }],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call groupService.create with correct user id and DTO', async () => {
      const createDto = { name: 'New Group' };
      await controller.create(createDto, mockRequest);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
    });
  });

  describe('findMyGroups', () => {
    it('should call groupService.findUserGroups with correct user id', async () => {
      await controller.findMyGroups(mockRequest);
      expect(service.findUserGroups).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('join', () => {
    it('should call groupService.joinGroup with correct id and user id', async () => {
      const groupId = 'group-123';
      await controller.join(groupId, mockRequest);
      expect(service.joinGroup).toHaveBeenCalledWith(groupId, mockUser.id);
    });
  });

  describe('leave', () => {
    it('should call groupService.leaveGroup with correct id and user id', async () => {
      const groupId = 'group-123';
      await controller.leave(groupId, mockRequest);
      expect(service.leaveGroup).toHaveBeenCalledWith(groupId, mockUser.id);
    });
  });
});
