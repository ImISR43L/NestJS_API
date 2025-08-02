// test/daily.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('DailyController (e2e)', () => {
  let app: INestApplication;
  let agent;
  let prisma: PrismaService;

  const testUser = {
    email: 'e2e-daily@test.com',
    username: 'e2e-daily-user',
    password: 'password123',
  };
  let createdDailyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
    agent = request.agent(app.getHttpServer());
    await request(app.getHttpServer()).post('/auth/register').send(testUser);
    await agent
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Daily Task Flow', () => {
    it('/dailies (POST) - should create a new daily task', () => {
      return agent
        .post('/dailies')
        .send({ title: 'E2E Daily Task' })
        .expect(201)
        .then((res) => {
          createdDailyId = res.body.id;
        });
    });

    it('/dailies/:id/complete (POST) - should complete the daily and update pet happiness', async () => {
      const petBefore = await agent.get('/pet');
      const initialHappiness = petBefore.body.happiness;

      await agent.post(`/dailies/${createdDailyId}/complete`).expect(200);

      const petAfter = await agent.get('/pet');
      // Completing a daily should increase happiness by 5
      expect(petAfter.body.happiness).toBe(initialHappiness + 5);
    }, 10000); // Timeout increased to 10 seconds
  });
});
