import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exceptions/custom.exception';
import { formatValidationErrors } from './common/utils/format';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Set your CORS origin here
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = formatValidationErrors(errors);

        return new UnprocessableEntityException({
          success: false,
          message: 'Validation error',
          errors: formattedErrors,
        });
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Baguspay Web API')
    .setDescription('API documentation for Baguspay Web application')
    .setVersion('1.0')
    .addTag('Baguspay Web')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    )
    .addGlobalParameters(
      {
        name: 'X-Time',
        in: 'header',
        required: false,
        schema: {
          type: 'timestamp',
          format: 'timestamp',
          example: new Date().getTime().toString(),
        },
      },
      {
        name: 'X-Request-ID',
        in: 'header',
        required: false,
        schema: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      {
        name: 'X-Device-ID',
        in: 'header',
        required: false,
        schema: {
          type: 'string',
          format: 'Device ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
      {
        name: 'X-Version',
        in: 'header',
        required: false,
        schema: {
          type: 'string',
          format: 'Version',
          example: '1.0.0',
        },
      },
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/reference',
    apiReference({
      content: document,
      persistAuth: true,
    }),
  );

  await app.listen(9991);
}

void bootstrap();
