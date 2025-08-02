// src/user/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { Request } from 'express';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      // No providers needed as we are only testing the controller's own logic
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user object from the request', () => {
      // Mock the user object that Passport would attach to the request
      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        username: 'testuser',
      };

      // Mock the request object
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const result = controller.getProfile(mockRequest);

      // The controller should simply return the user object it was given
      expect(result).toEqual(mockUser);
    });
  });
});
