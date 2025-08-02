// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

// Mock AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with the correct data', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const expectedResult = { id: '1', ...registerDto };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and set a cookie on success', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const loginResult = {
        accessToken: 'token',
        user: { id: '1', email: loginDto.email },
      };
      mockAuthService.login.mockResolvedValue(loginResult);

      // Mock the response object from Express
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, mockResponse);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'token',
        expect.any(Object),
      );
      expect(result.message).toEqual('Login successful');
    });

    it('should throw an UnauthorizedException if login service returns null', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue(null);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear the access_token cookie', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(result.message).toEqual('Logout successful');
    });
  });
});
