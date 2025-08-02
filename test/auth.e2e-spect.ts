// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser'; // 1. Import cookie-parser
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUser = {
    email: 'e2e-auth@test.com',
    username: 'e2e-auth-user',
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
    app.use(cookieParser()); // 2. Add the cookie-parser middleware to the test app
    await app.init();

    prisma = app.get(PrismaService);
    await request(app.getHttpServer()).post('/auth/register').send(testUser);
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('User Authentication Flow', () => {
    let agent;
    beforeAll(() => {
      agent = request.agent(app.getHttpServer());
    });

    it('should successfully log in and the agent should store the cookie', () => {
      return agent
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);
    });

    it('should successfully access a protected route using the agent (with cookie)', () => {
      return agent
        .get('/users/profile')
        .expect(200)
        .then((res) => {
          expect(res.body.email).toEqual(testUser.email);
        });
    });
  });
});
