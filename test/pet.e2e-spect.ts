// test/todo.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let agent;
  let prisma: PrismaService;

  const testUser = {
    email: 'e2e-todo@test.com',
    username: 'e2e-todo-user',
    password: 'password123',
  };
  let createdTodoId: string;

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

  describe('Todo Lifecycle', () => {
    it('/todos (POST) - should create a new to-do task', () => {
      return agent
        .post('/todos')
        .send({ title: 'Finish E2E tests for To-Do' })
        .expect(201)
        .then((res) => {
          expect(res.body.title).toEqual('Finish E2E tests for To-Do');
          expect(res.body.completed).toBe(false);
          createdTodoId = res.body.id;
        });
    });

    it('/todos/:id/complete (POST) - should complete the to-do and update pet happiness', async () => {
      const petBefore = await agent.get('/pet');
      const initialHappiness = petBefore.body.happiness;

      await agent.post(`/todos/${createdTodoId}/complete`).expect(200);

      const petAfter = await agent.get('/pet');
      // Completing a todo should increase happiness by 5
      expect(petAfter.body.happiness).toBe(initialHappiness + 5);
    }, 10000); // Timeout increased to 10 seconds

    it('/todos/:id/complete (POST) - should fail to complete the same task again', () => {
      return agent.post(`/todos/${createdTodoId}/complete`).expect(409); // Conflict
    });

    it('/todos/:id (DELETE) - should delete the completed to-do', () => {
      return agent.delete(`/todos/${createdTodoId}`).expect(204); // No Content
    });
  });
});
