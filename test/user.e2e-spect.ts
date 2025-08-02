// test/user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let agent;
  let prisma: PrismaService;

  const testUser = {
    email: 'e2e-user@test.com',
    username: 'e2e-user',
    password: 'password123',
  };

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
    await request(app.getHttpServer()).post('/auth/register').send(testUser);
    await agent
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/users/profile (GET)', () => {
    it('should successfully get profile if authenticated', () => {
      return agent
        .get('/users/profile')
        .expect(200)
        .then((res) => {
          expect(res.body.email).toEqual(testUser.email);
        });
    });
  });
});
