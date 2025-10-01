import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../src/modules/auth/auth.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/database/entities/user.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Mock repository for testing
class MockUserRepository {
  private users: any[] = [];

  create(userData: any): any {
    const user = {
      id: 'test-uuid',
      fullName: `${userData.firstName} ${userData.lastName}`,
      validatePassword: jest.fn().mockImplementation((password: string) => {
        // Mock bcrypt comparison logic
        return Promise.resolve(password === 'password123' && userData.password === 'hashed-password123');
      }),
      validateRefreshToken: jest.fn().mockResolvedValue(true),
      ...userData,
    };
    return user;
  }

  async save(user: any): Promise<any> {
    this.users.push(user);
    return user;
  }

  async findOne(options: any): Promise<any | null> {
    const { where } = options;
    
    // Handle login case - find by email
    if (where?.email === 'test@example.com') {
      return {
        id: 'test-uuid',
        email: 'test@example.com',
        password: 'hashed-password123',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        refreshTokens: [],
        validatePassword: jest.fn().mockImplementation((password: string) => {
          return Promise.resolve(password === 'password123');
        }),
        validateRefreshToken: jest.fn().mockResolvedValue(true),
      };
    }
    
    // Handle JWT validation - find by id
    if (where?.id === 'test-uuid' && where?.isActive === true) {
      return {
        id: 'test-uuid',
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        refreshTokens: [],
        validatePassword: jest.fn().mockResolvedValue(true),
        validateRefreshToken: jest.fn().mockResolvedValue(true),
      };
    }
    
    // Handle other queries
    return this.users.find(user =>
      user.email === where?.email &&
      user.isActive === where?.isActive
    ) || null;
  }

  async update(criteria: any, updateData: any): Promise<any> {
    const user = this.users.find(u => u.email === criteria.email);
    if (user) {
      Object.assign(user, updateData);
    }
    return { affected: 1 };
  }

  async clear(): Promise<void> {
    this.users = [];
  }
}

describe('Auth E2E', () => {
  let app: INestApplication;
  let userRepository: MockUserRepository;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CSO,
  };

  beforeAll(async () => {
    userRepository = new MockUserRepository();

    // Mock JWT Strategy
    const mockJwtStrategy = {
      validate: jest.fn().mockImplementation((payload) => {
        return {
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
          firstName: 'Test',
          lastName: 'User',
        };
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
      ],
    })
    .overrideProvider(getRepositoryToken(User))
    .useValue(userRepository)
    .overrideProvider('JwtStrategy')
    .useValue(mockJwtStrategy)
    .overrideProvider(ConfigService)
    .useValue({
      get: jest.fn((key: string) => {
        const config = {
          'jwt.secret': 'test-secret-key',
          'jwt.expiresIn': '1h',
          'jwt.refreshSecret': 'test-refresh-secret-key',
          'jwt.refreshExpiresIn': '7d',
        };
        return config[key];
      }),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      const user = userRepository.create({
        ...testUser,
        password: 'hashed-password123',
        isActive: true,
      });
      await userRepository.save(user);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const user = userRepository.create({
        ...testUser,
        password: 'hashed-password123',
        isActive: true,
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    let accessToken: string;

    beforeEach(async () => {
      const user = userRepository.create({
        ...testUser,
        password: 'hashed-password123',
        isActive: true,
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Successfully logged out');
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });
  });
});