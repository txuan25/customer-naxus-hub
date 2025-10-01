import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../../database/entities/user.entity';
import { UserRole } from '../../../common/enums/user-role.enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: jest.Mocked<Repository<User>>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CSO,
    isActive: true,
  } as User;

  const mockJwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
    iat: 1234567890,
    exp: 1234567890 + 900, // 15 minutes later
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get(getRepositoryToken(User));
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user data when user exists and is active', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate(mockJwtPayload);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJwtPayload.sub, isActive: true },
      });
      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJwtPayload.sub, isActive: true },
      });
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      userRepository.findOne.mockResolvedValue(null); // TypeORM query with isActive: true returns null for inactive users

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJwtPayload.sub, isActive: true },
      });
    });

    it('should handle database errors properly', async () => {
      // Arrange
      const dbError = new Error('Database connection error');
      userRepository.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(dbError);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJwtPayload.sub, isActive: true },
      });
    });
  });

  describe('constructor', () => {
    it('should configure strategy with correct options', () => {
      // Assert that configService.get was called with correct key
      expect(configService.get).toHaveBeenCalledWith('jwt.secret');
    });
  });
});