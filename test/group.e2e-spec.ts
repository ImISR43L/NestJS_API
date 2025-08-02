// test/group.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GroupController (e2e)', () => {
  let app: INestApplication;
  let agent1;
  let agent2;
  let prisma: PrismaService;

  const user1 = {
    email: 'e2e-group1@test.com',
    username: 'e2e-group1',
    password: 'password123',
  };
  const user2 = {
    email: 'e2e-group2@test.com',
    username: 'e2e-group2',
    password: 'password123',
  };

  let createdGroupId: string;

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
    agent1 = request.agent(app.getHttpServer());
    agent2 = request.agent(app.getHttpServer());

    await request(app.getHttpServer()).post('/auth/register').send(user1);
    await agent1
      .post('/auth/login')
      .send({ email: user1.email, password: user1.password });

    await request(app.getHttpServer()).post('/auth/register').send(user2);
    await agent2
      .post('/auth/login')
      .send({ email: user2.email, password: user2.password });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Group Creation and Social Flow', () => {
    it('/groups (POST) - User 1 creates a new group', () => {
      return agent1
        .post('/groups')
        .send({ name: 'E2E Test Crew', description: 'A group for testing' })
        .expect(201)
        .then((res) => {
          createdGroupId = res.body.id;
        });
    });

    it('/groups/:id/join (POST) - User 2 joins the group', () => {
      return agent2.post(`/groups/${createdGroupId}/join`).expect(200);
    });

    it('/groups/:id/leave (DELETE) - User 2 leaves the group', () => {
      return agent2.delete(`/groups/${createdGroupId}/leave`).expect(204);
    });
  });
});
