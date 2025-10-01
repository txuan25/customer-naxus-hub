import { ConfigService } from '@nestjs/config';

// Mock environment variables for E2E tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock bcrypt if it's not available (for CI/CD environments)
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password: string) => Promise.resolve(`hashed-${password}`)),
  compare: jest.fn().mockImplementation((password: string, hash: string) => {
    return Promise.resolve(hash === `hashed-${password}`);
  }),
}));