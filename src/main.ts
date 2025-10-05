import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isDevelopment = process.env.NODE_ENV === 'development';

  app.enableCors({
    origin: isDevelopment
      ? [
          // Web development
          'http://localhost:3000',
          'http://localhost:3001',
          // React Native Metro bundler
          'http://localhost:19000',
          'http://localhost:19006',
          // Android emulator
          'http://10.0.2.2:19000',
          'http://10.0.2.2:19006',
          // Common local network ranges for physical devices
          /^http:\/\/192\.168\.\d+\.\d+:19000$/,
          /^http:\/\/172\.16\.\d+\.\d+:19000$/,
          /^http:\/\/10\.0\.\d+\.\d+:19000$/,
          // Expo development
          /^https:\/\/.*\.exp\.direct$/,
          /^https:\/\/.*\.ngrok\.io$/,
        ]
      : process.env.ALLOWED_ORIGINS?.split(',') || [],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    optionsSuccessStatus: 200,
  });

  const config = new DocumentBuilder()
    .setTitle('Tour Guide example')
    .setDescription('The tour-guide API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'Enter your JWT token here (e.g., Bearer <token>)',
      },
      'access-token',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        }));

        return new BadRequestException({
          message: 'Validation failed',
          errors: result,
        });
      },
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
