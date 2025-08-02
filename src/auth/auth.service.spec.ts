// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrismaClient = {
  user: { create: jest.fn() },
  pet: { create: jest.fn() },
  $transaction: jest
    .fn()
    .mockImplementation(async (callback) => await callback(mockPrismaClient)),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: { findByEmailOrUsername: jest.fn() },
        },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: PrismaService, useValue: mockPrismaClient },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user and create a default pet', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const createdUser = { id: 'user-1', ...registerDto };

      jest.spyOn(userService, 'findByEmailOrUsername').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      mockPrismaClient.user.create.mockResolvedValue(createdUser);

      await authService.register(registerDto);

      expect(mockPrismaClient.pet.create).toHaveBeenCalledWith({
        data: {
          userId: createdUser.id,
          name: `${createdUser.username}'s Pet`,
        },
      });
    });
  });
});
