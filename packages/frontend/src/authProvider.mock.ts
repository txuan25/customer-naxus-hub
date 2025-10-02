import type { AuthProvider } from "@refinedev/core";
import type { User, LoginResponse } from "./types";
import { UserRole } from "./types";

export const TOKEN_KEY = "customer-nexus-auth-token";
export const REFRESH_TOKEN_KEY = "customer-nexus-refresh-token";
export const USER_KEY = "customer-nexus-user";

// Mock users for development
const mockUsers: User[] = [
  {
    id: "1",
    email: "cso1@cnh.com",
    firstName: "John",
    lastName: "CSO",
    fullName: "John CSO",
    role: UserRole.CSO,
  },
  {
    id: "2", 
    email: "manager1@cnh.com",
    firstName: "Jane",
    lastName: "Manager",
    fullName: "Jane Manager",
    role: UserRole.MANAGER,
  },
  {
    id: "3",
    email: "admin@cnh.com", 
    firstName: "Admin",
    lastName: "User",
    fullName: "Admin User",
    role: UserRole.ADMIN,
  }
];

const mockPasswords: Record<string, string> = {
  "cso1@cnh.com": "Cso@123",
  "manager1@cnh.com": "Manager@123", 
  "admin@cnh.com": "Admin@123"
};

export const authProviderMock: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find(u => u.email === email);
      const validPassword = mockPasswords[email];

      if (!user || password !== validPassword) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "Invalid email or password",
          },
        };
      }

      // Mock tokens
      const mockTokens = {
        accessToken: `mock-jwt-token-${user.id}`,
        refreshToken: `mock-refresh-token-${user.id}`,
        user
      };
      
      // Store tokens and user data
      localStorage.setItem(TOKEN_KEY, mockTokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, mockTokens.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockTokens.user));

      // Redirect based on role
      let redirectTo = "/";
      if (user.role === UserRole.CSO) {
        redirectTo = "/dashboard/cso";
      } else if (user.role === UserRole.MANAGER) {
        redirectTo = "/dashboard/manager";
      }

      return {
        success: true,
        redirectTo,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Mock login error. Please try again.",
        },
      };
    }
  },

  logout: async () => {
    // Always clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    if (token && user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const user: User = JSON.parse(userStr);
      return user.role;
    }
    return null;
  },

  getIdentity: async () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const user: User = JSON.parse(userStr);
      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        avatar: `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1890FF&color=fff`,
        role: user.role,
      };
    }
    return null;
  },

  onError: async (error) => {
    console.error("Auth error:", error);
    return { error };
  },
};