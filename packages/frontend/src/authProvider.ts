import type { AuthProvider } from "@refinedev/core";
import type { User, LoginResponse } from "./types";
import { UserRole } from "./types";

export const TOKEN_KEY = "customer-nexus-auth-token";
export const REFRESH_TOKEN_KEY = "customer-nexus-refresh-token";
export const USER_KEY = "customer-nexus-user";

const API_BASE_URL = "http://localhost:3000/api/v1";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: {
            name: "LoginError",
            message: error.error?.message || "Invalid email or password",
          },
        };
      }

      const data: LoginResponse = await response.json();
      
      // Store tokens and user data
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      // Redirect based on role
      let redirectTo = "/";
      if (data.user.role === UserRole.CSO) {
        redirectTo = "/dashboard/cso";
      } else if (data.user.role === UserRole.MANAGER) {
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
          message: "Network error. Please try again.",
        },
      };
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    if (token && user) {
      try {
        // Verify token is still valid by making a test request
        const response = await fetch(`${API_BASE_URL}/customers?page=1&limit=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          return {
            authenticated: true,
          };
        }

        // Token is invalid, try to refresh
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData: LoginResponse = await refreshResponse.json();
            localStorage.setItem(TOKEN_KEY, refreshData.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshData.refreshToken);
            localStorage.setItem(USER_KEY, JSON.stringify(refreshData.user));
            
            return {
              authenticated: true,
            };
          }
        }

        // Both access and refresh tokens are invalid
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch (error) {
        console.error("Auth check error:", error);
      }
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
    
    // Handle 401 errors by redirecting to login
    if (error?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    return { error };
  },
};
