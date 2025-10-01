import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration values
  const port = configService.get<number>('app.port', 3000);
  const corsOrigin = configService.get<string[]>('app.cors.origin');
  const swaggerEnabled = configService.get<boolean>('app.swagger.enabled');
  const nodeEnv = configService.get<string>('app.nodeEnv');

  // Compression
  app.use(compression());

  // Cookie parser
  app.use(cookieParser());

  // Security Headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: nodeEnv === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    } : false,
    crossOriginEmbedderPolicy: nodeEnv === 'production',
    hsts: nodeEnv === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    } : false,
  }));

  // Global Rate Limiting is handled by ThrottlerModule in app.module.ts

  // Enable CORS with credentials
  app.enableCors({
    origin: corsOrigin || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-Id'],
    exposedHeaders: ['X-Correlation-Id', 'X-Total-Count', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    maxAge: 86400, // 24 hours
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    errorHttpStatusCode: 422, // Use 422 for validation errors
  }));

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger Documentation
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle(configService.get('app.swagger.title', 'Customer Nexus Hub API'))
      .setDescription(configService.get('app.swagger.description', 'CRM Platform API Documentation'))
      .setVersion(configService.get('app.swagger.version', '1.0'))
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT access token',
          in: 'header',
        },
        'access-token',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT Refresh',
          description: 'Enter JWT refresh token',
          in: 'header',
        },
        'refresh-token',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('customers', 'Customer management')
      .addTag('inquiries', 'Inquiry management')
      .addTag('responses', 'Response management')
      .addTag('users', 'User management')
      .addTag('health', 'Health checks')
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for external service access',
        },
        'api-key',
      )
      .addServer('http://localhost:3000', 'Local Development')
      .addServer('https://api.customernexushub.com', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configService.get('app.swagger.path', 'api-docs'),
      app,
      document,
      {
        customSiteTitle: 'CNH API Documentation',
        customfavIcon: 'https://nestjs.com/img/logo_text.svg',
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info { margin-bottom: 50px }
          .swagger-ui .scheme-container { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px }
        `,
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
        },
      },
    );
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  await app.listen(port);
  
  // Startup message
  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 Customer Nexus Hub API is running!');
  console.log('='.repeat(60));
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`🌐 API: http://localhost:${port}/api/v1`);
  if (swaggerEnabled) {
    console.log(`📚 Docs: http://localhost:${port}/${configService.get('app.swagger.path', 'api-docs')}`);
  }
  console.log(`🔐 Environment: ${nodeEnv}`);
  console.log(`⚡ Rate Limiting: Enabled`);
  console.log(`🔒 Security Headers: Enabled`);
  console.log(`📊 Logging: Enabled`);
  console.log('='.repeat(60) + '\n');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
