import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController, LoginRequestDto, RefreshTokenDto } from './auth.controller';
import { AuthService, AuthResponse } from './auth.service';
import { UserRole } from '../../common/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: UserRole.CSO,
    },
  };

  const mockLoginDto: LoginRequestDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRefreshTokenDto: RefreshTokenDto = {
    refreshToken: 'mock-refresh-token',
  };

  const mockRequest = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: UserRole.CSO,
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return auth response when login is successful', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.login(mockLoginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toBe(mockAuthResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      authService.login.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.login(mockLoginDto)).rejects.toThrow(serviceError);
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    });
  });

  describe('refresh', () => {
    it('should return new auth response when refresh token is valid', async () => {
      // Arrange
      authService.refreshToken.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.refresh(mockRefreshTokenDto);

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
      expect(result).toBe(mockAuthResponse);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      authService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      // Act & Assert
      await expect(controller.refresh(mockRefreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      authService.refreshToken.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.refresh(mockRefreshTokenDto)).rejects.toThrow(serviceError);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
    });
  });

  describe('logout', () => {
    it('should return success message when logout is successful', async () => {
      // Arrange
      const expectedResponse = { message: 'Successfully logged out' };
      authService.logout.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.logout(mockRequest);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toBe(expectedResponse);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      authService.logout.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.logout(mockRequest)).rejects.toThrow(serviceError);
      expect(authService.logout).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });
});