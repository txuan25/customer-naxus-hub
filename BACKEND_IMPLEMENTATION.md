# Backend Implementation Roadmap

## Step-by-Step Backend Implementation Guide

### Phase 1: Project Foundation

#### Step 1.1: Initialize Monorepo
```bash
# Create project structure
mkdir -p customer-nexus-hub/packages/{backend,frontend}
cd customer-nexus-hub

# Initialize pnpm workspace
pnpm init
```

#### Step 1.2: Setup NestJS Backend
```bash
cd packages/backend
nest new . --package-manager pnpm --skip-git
```

#### Step 1.3: Install Core Dependencies
```bash
# Core dependencies
pnpm add @nestjs/config @nestjs/typeorm typeorm pg
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add @nestjs/swagger swagger-ui-express
pnpm add bcrypt class-validator class-transformer
pnpm add @nestjs/bull bull
pnpm add cache-manager cache-manager-redis-store redis

# Dev dependencies
pnpm add -D @types/bcrypt @types/passport-jwt
pnpm add -D @types/cache-manager
```

### Phase 2: Database Setup

#### Step 2.1: TypeORM Configuration
```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
});
```

#### Step 2.2: Entity Definitions
```typescript
// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CSO,
  })
  role: UserRole;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Phase 3: Authentication Implementation

#### Step 3.1: JWT Strategy
```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

#### Step 3.2: Auth Service
```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
```

### Phase 4: RBAC Implementation

#### Step 4.1: Roles Guard
```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### Step 4.2: Roles Decorator
```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### Phase 5: Business Logic Modules

#### Step 5.1: Customer Service
```typescript
// src/modules/customers/customers.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findAll(paginationDto: PaginationDto, userId: string, userRole: string) {
    const { page = 1, limit = 10, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');
    
    // Role-based filtering
    if (userRole === 'CSO') {
      queryBuilder.where('customer.assignedTo = :userId', { userId });
    }
    
    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    
    // Status filter
    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }
    
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      createdBy: userId,
      assignedTo: userId,
    });
    
    return this.customerRepository.save(customer);
  }
}
```

#### Step 5.2: Response Approval Workflow
```typescript
// src/modules/responses/responses.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from '../../entities/response.entity';
import { ResponseStatus } from '../../enums/response-status.enum';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
  ) {}

  async submitForApproval(id: string, userId: string) {
    const response = await this.responseRepository.findOne({
      where: { id, respondedBy: userId, status: ResponseStatus.DRAFT },
    });
    
    if (!response) {
      throw new NotFoundException('Response not found or not in draft status');
    }
    
    response.status = ResponseStatus.PENDING_APPROVAL;
    return this.responseRepository.save(response);
  }

  async approve(id: string, userId: string, notes?: string) {
    const response = await this.responseRepository.findOne({
      where: { id, status: ResponseStatus.PENDING_APPROVAL },
    });
    
    if (!response) {
      throw new NotFoundException('Response not found or not pending approval');
    }
    
    response.status = ResponseStatus.APPROVED;
    response.approvedBy = userId;
    response.approvalNotes = notes;
    
    // Here you would trigger the email queue
    // this.emailQueue.add('send-response', { responseId: id });
    
    return this.responseRepository.save(response);
  }

  async reject(id: string, userId: string, notes: string) {
    const response = await this.responseRepository.findOne({
      where: { id, status: ResponseStatus.PENDING_APPROVAL },
    });
    
    if (!response) {
      throw new NotFoundException('Response not found or not pending approval');
    }
    
    response.status = ResponseStatus.REJECTED;
    response.approvedBy = userId;
    response.approvalNotes = notes;
    
    return this.responseRepository.save(response);
  }
}
```

### Phase 6: Cross-Cutting Concerns

#### Step 6.1: Global Exception Filter
```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message,
      error: typeof message === 'object' ? (message as any).error : undefined,
    });
  }
}
```

#### Step 6.2: Request Logging Interceptor
```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = uuidv4();
    request.correlationId = correlationId;

    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log({
      correlationId,
      method,
      url,
      body,
      message: 'Request received',
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        
        this.logger.log({
          correlationId,
          method,
          url,
          statusCode,
          duration: `${Date.now() - now}ms`,
          message: 'Request completed',
        });
      }),
    );
  }
}
```

### Phase 7: Testing Implementation

#### Step 7.1: Unit Test Example
```typescript
// src/modules/customers/customers.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer } from '../../entities/customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should create a customer', async () => {
    const createDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };
    
    const userId = 'user-123';
    const expectedCustomer = { ...createDto, id: 'customer-123', createdBy: userId };
    
    mockRepository.create.mockReturnValue(expectedCustomer);
    mockRepository.save.mockResolvedValue(expectedCustomer);

    const result = await service.create(createDto, userId);
    
    expect(result).toEqual(expectedCustomer);
    expect(mockRepository.create).toHaveBeenCalledWith({
      ...createDto,
      createdBy: userId,
      assignedTo: userId,
    });
  });
});
```

#### Step 7.2: E2E Test Example
```typescript
// test/customers.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Customers (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.access_token;
  });

  it('/customers (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Next Steps

1. **Database Migrations**: Create proper migration files instead of using synchronize
2. **Seed Data**: Create seeders for initial data
3. **API Documentation**: Complete Swagger decorators
4. **Error Handling**: Implement comprehensive error handling
5. **Caching**: Implement Redis caching for frequently accessed data
6. **Queue System**: Setup Bull for async operations
7. **Monitoring**: Add health checks and metrics
8. **Security**: Implement rate limiting, helmet, CORS
9. **CI/CD**: Setup GitHub Actions
10. **Deployment**: Create production Dockerfile and docker-compose