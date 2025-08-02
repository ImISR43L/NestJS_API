import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORRECTED CORS Configuration ---
  // This is a more robust configuration for CodeSandbox and local development.
  app.enableCors({
    origin: [
      'https://4mnpqf-5173.csb.app', // Your CodeSandbox frontend URL
      'http://localhost:5173', // For local development
    ],
    credentials: true, // This is crucial for cookies to be sent and received
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Habit Rewards API')
    .setDescription(
      'The official API documentation for the Habit Rewards & Virtual Pet application.',
    )
    .setVersion('1.0')
    .addTag('API')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
