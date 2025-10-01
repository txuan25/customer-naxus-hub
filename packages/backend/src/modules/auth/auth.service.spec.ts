import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, LoginDto, JwtPayload } from './auth.service';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    role: UserRole.CSO,
    isActive: true,
    validatePassword: jest.fn(),
    validateRefreshToken: jest.fn(),
  } as unknown as User;

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockJwtPayload: JwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
    type: 'access',
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup default config service responses
    configService.get.mockImplementation((key: string) => {
      const config = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens and user data when credentials are valid', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      (mockUser.validatePassword as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);

      // Act
      const result = await service.login(mockLoginDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginDto.email, isActive: true },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
      });
      expect(mockUser.validatePassword).toHaveBeenCalledWith(mockLoginDto.password);
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          fullName: mockUser.fullName,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginDto.email, isActive: true },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      (mockUser.validatePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(mockUser.validatePassword).toHaveBeenCalledWith(mockLoginDto.password);
    });

    it('should generate tokens with correct payload', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      (mockUser.validatePassword as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);

      // Act
      await service.login(mockLoginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      
      // Check access token generation
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access',
      }, {
        secret: 'test-secret',
        expiresIn: '15m',
      });

      // Check refresh token generation
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'refresh',
      }, {
        secret: 'test-refresh-secret',
        expiresIn: '7d',
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const refreshPayload: JwtPayload = {
        ...mockJwtPayload,
        type: 'refresh',
      };

      jwtService.verifyAsync.mockResolvedValue(refreshPayload);
      userRepository.findOne.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);

      // Act
      const result = await service.refreshToken(refreshToken);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: refreshPayload.sub, isActive: true },
      });
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          fullName: mockUser.fullName,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException when token type is not refresh', async () => {
      // Arrange
      const refreshToken = 'invalid-type-token';
      const accessPayload: JwtPayload = {
        ...mockJwtPayload,
        type: 'access',
      };

      jwtService.verifyAsync.mockResolvedValue(accessPayload);

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const refreshPayload: JwtPayload = {
        ...mockJwtPayload,
        type: 'refresh',
      };

      jwtService.verifyAsync.mockResolvedValue(refreshPayload);
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      // Arrange
      const userId = 'test-user-id';

      // Act
      const result = await service.logout(userId);

      // Assert
      expect(result).toEqual({ message: 'Successfully logged out' });
    });
  });

  describe('validateJwtPayload', () => {
    it('should return user when payload is valid', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateJwtPayload(mockJwtPayload);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJwtPayload.sub, isActive: true },
      });
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateJwtPayload(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive'),
      );
    });
  });
});