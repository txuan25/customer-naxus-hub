import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'crm_user',
  password: process.env.DATABASE_PASSWORD || 'crmpass123',
  database: process.env.DATABASE_NAME || 'customer_nexus_hub',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Disable auto-sync to avoid index conflicts
  logging: process.env.NODE_ENV === 'development',
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: true,
  extra: {
    max: 20, // Connection pool size
    idleTimeoutMillis: 30000,
  },
}));