// test/habit.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('HabitController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let agent;

  const testUser = {
    email: 'e2e-habit@test.com',
    username: 'e2e-habit-user',
    password: 'password123',
    id: '', // Will be populated after creation
  };

  let createdHabitId: string;
  let hardHabitId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    await app.init();

    agent = request.agent(app.getHttpServer());
    prisma = app.get(PrismaService);

    // Register user and get their ID
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
    testUser.id = registerResponse.body.id;

    await agent
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    // Manually set user's gold to a high amount for testing
    await prisma.user.update({
      where: { id: testUser.id },
      data: { gold: 1000 },
    });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Habit CRUD and Logic Flow', () => {
    it('/habits (POST) - should create a new MEDIUM habit', async () => {
      const response = await agent
        .post('/habits')
        .send({ title: 'Read a book', difficulty: 'MEDIUM' })
        .expect(201);

      expect(response.body.title).toEqual('Read a book');
      createdHabitId = response.body.id;
    });

    it('/habits/:id (DELETE) - should fail to delete the habit without meeting criteria', async () => {
      await agent.delete(`/habits/${createdHabitId}`).expect(403); // Forbidden
    });

    it('/habits/:id (DELETE) - should successfully delete the habit by paying the cost', async () => {
      await agent.delete(`/habits/${createdHabitId}`).expect(200); // OK

      const userAfter = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      // Add this check to handle the possibility of null
      if (!userAfter) {
        throw new Error(
          'Test failed: User not found in the database after deletion attempt.',
        );
      }

      // Initial 1000 gold - 100 for MEDIUM habit = 900
      expect(userAfter.gold).toBe(900);
    });

    it('/habits (POST) - should create a new HARD habit for testing updates', async () => {
      const response = await agent
        .post('/habits')
        .send({ title: 'Learn a new skill', difficulty: 'HARD' })
        .expect(201);
      hardHabitId = response.body.id;
    });

    it('/habits/:id (PATCH) - should successfully downgrade difficulty and deduct gold', async () => {
      await agent
        .patch(`/habits/${hardHabitId}`)
        .send({ difficulty: 'TRIVIAL' })
        .expect(200);

      const userAfter = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      if (!userAfter) {
        throw new Error(
          'Test failed: User not found in the database after deletion attempt.',
        );
      }
      // 900 gold - 250 (HARD to TRIVIAL) = 650
      expect(userAfter.gold).toBe(650);
    });
  });
});
