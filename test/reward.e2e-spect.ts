// test/reward.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('RewardController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let agent;

  const testUser = {
    email: 'e2e-reward@test.com',
    username: 'e2e-reward-user',
    password: 'password123',
  };
  let createdRewardId: string;
  let testUserId: string;

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

    agent = request.agent(app.getHttpServer());
    prisma = app.get(PrismaService);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
    testUserId = res.body.id;
    await agent
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Reward Lifecycle', () => {
    it('/rewards (POST) - should create a new reward', () => {
      return agent
        .post('/rewards')
        .send({ title: 'E2E Test Reward', cost: 75 })
        .expect(201)
        .then((res) => {
          createdRewardId = res.body.id;
        });
    });

    it('/rewards/:id/redeem (POST) - should fail to redeem if user has insufficient gold', () => {
      // User starts with 10 gold, reward costs 75
      return agent.post(`/rewards/${createdRewardId}/redeem`).expect(409); // Conflict
    });

    it('/rewards/:id/redeem (POST) - should redeem reward after user gains enough gold', async () => {
      // Manually give the user enough gold for the test
      await prisma.user.update({
        where: { id: testUserId },
        data: { gold: { set: 100 } },
      });

      return agent
        .post(`/rewards/${createdRewardId}/redeem`)
        .expect(200)
        .then(async (res) => {
          expect(res.body.message).toContain('Successfully redeemed');
          // User had 100 gold, spent 75.
          expect(res.body.newGoldBalance).toBe(25);

          // Verify in DB
          const userAfter = await prisma.user.findUnique({
            where: { id: testUserId },
          });
          // Add a check to ensure userAfter is not null
          if (!userAfter) {
            throw new Error(
              'Test failed: User could not be found after redemption.',
            );
          }
          expect(userAfter.gold).toBe(25);
        });
    });
  });
});
