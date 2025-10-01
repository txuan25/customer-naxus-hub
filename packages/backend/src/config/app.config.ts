import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  name: process.env.APP_NAME || 'Customer Nexus Hub',
  version: process.env.APP_VERSION || '1.0.0',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'Customer Nexus Hub API',
    description: process.env.SWAGGER_DESCRIPTION || 'API documentation for Customer Nexus Hub CRM platform',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'api-docs',
  },
}));