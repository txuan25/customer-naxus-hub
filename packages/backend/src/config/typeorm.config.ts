import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'crm_user',
  password: process.env.DATABASE_PASSWORD || 'crm_password',
  database: process.env.DATABASE_NAME || 'crm_db',
  entities: [
    join(__dirname, '../entities/**/*.entity{.ts,.js}'),
    join(__dirname, '../modules/**/*.entity{.ts,.js}')
  ],
  migrations: [join(__dirname, '../migrations/**/*{.ts,.js}')],
  synchronize: false, // NEVER true in production!
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;