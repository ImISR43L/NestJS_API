// src/group/group.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Group, UserGroup } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  group: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  userGroup: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
  $transaction: jest
    .fn()
    .mockImplementation(async (callback) => await callback(mockPrisma)),
};

const mockGroup: Group = {
  id: 'group-1',
  name: 'Test Group',
  description: 'Desc',
  isPublic: true,
  createdAt: new Date(),
};
const mockUserGroup: UserGroup = {
  id: 'user-group-1',
  userId: 'user-1',
  groupId: 'group-1',
  role: 'ADMIN',
  joinedAt: new Date(),
};

describe('GroupService', () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<GroupService>(GroupService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group and make the creator an ADMIN', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null); // No existing group with the same name
      mockPrisma.group.create.mockResolvedValue(mockGroup);

      const createDto = { name: 'Test Group', description: 'Desc' };
      await service.create(createDto, 'user-1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.group.create).toHaveBeenCalledWith({ data: createDto });
      expect(mockPrisma.userGroup.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', groupId: mockGroup.id, role: 'ADMIN' },
      });
    });

    it('should throw ConflictException if group name is taken', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);
      await expect(
        service.create({ name: 'Test Group' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user is not an admin', async () => {
      const nonAdminMembership = { ...mockUserGroup, role: 'MEMBER' };
      mockPrisma.userGroup.findUnique.mockResolvedValue(nonAdminMembership);

      await expect(
        service.update('group-1', { name: 'New Name' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow an admin to update the group', async () => {
      mockPrisma.userGroup.findUnique.mockResolvedValue(mockUserGroup); // User is an ADMIN
      const updateDto = { description: 'New description' };

      await service.update('group-1', updateDto, 'user-1');

      expect(mockPrisma.group.update).toHaveBeenCalledWith({
        where: { id: 'group-1' },
        data: updateDto,
      });
    });
  });

  describe('joinGroup', () => {
    it('should throw ConflictException if user is already a member', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);
      mockPrisma.userGroup.findUnique.mockResolvedValue(mockUserGroup); // Already a member

      await expect(service.joinGroup('group-1', 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
