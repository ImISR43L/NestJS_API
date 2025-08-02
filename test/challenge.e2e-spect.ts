// test/challenge.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ChallengeController (e2e)', () => {
  let app: INestApplication;
  let agent;
  let prisma: PrismaService;

  const user1 = {
    email: 'e2e-challenge1@test.com',
    username: 'e2e-challenge1',
    password: 'password123',
  };

  let createdChallengeId: string;
  let user1ParticipationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.use(cookieParser()); // Add cookie parser
    await app.init();

    prisma = app.get(PrismaService);
    agent = request.agent(app.getHttpServer());
    await request(app.getHttpServer()).post('/auth/register').send(user1);
    await agent
      .post('/auth/login')
      .send({ email: user1.email, password: user1.password });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Challenge Creation and Participation', () => {
    it('/challenges (POST) - should create a new public challenge', () => {
      return agent
        .post('/challenges')
        .send({
          title: 'E2E Reading Challenge',
          description: 'Read 5 books',
          goal: 'Read 5 books',
        })
        .expect(201)
        .then((res) => {
          createdChallengeId = res.body.id;
        });
    });

    it('/challenges/:id/join (POST) - should allow the user to join', () => {
      return agent
        .post(`/challenges/${createdChallengeId}/join`)
        .expect(200)
        .then((res) => {
          user1ParticipationId = res.body.id;
        });
    });

    it('/challenges/participation/:userChallengeId/leave (DELETE) - should allow the user to leave', () => {
      return agent
        .delete(`/challenges/participation/${user1ParticipationId}/leave`)
        .expect(204);
    });
  });
});
