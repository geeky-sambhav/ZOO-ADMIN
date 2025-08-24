"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) {
            set({ isLoading: false });
            return;
          }

          // Check if user is authenticated by calling a protected endpoint
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const userData = await response.json();

            // Transform backend response to match frontend User interface
            const user = {
              id: userData._id,
              email: userData.email,
              name: userData.username,
              role: "admin" as UserRole, // You may need to add role to your backend response
              createdAt: new Date(), // You may need to add this to your backend response
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.warn("Auth initialization failed:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) {
            throw new Error("API URL not configured");
          }

          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Handle both error response formats from your backend
            const errorMessage =
              errorData.message || errorData.error || "Invalid credentials";
            throw new Error(errorMessage);
          }

          const data = await response.json();

          // Check if login was successful
          if (!data.success) {
            throw new Error(data.message || "Login failed");
          }

          // After successful login, fetch user data
          // Since the backend sets the JWT cookie, we can now call the /me endpoint
          const userResponse = await fetch(`${apiUrl}/api/auth/me`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
          }

          const userData = await userResponse.json();

          // Backend returns { _id, username, email } directly, not nested in user object
          if (!userData._id || !userData.email) {
            throw new Error("Invalid user data received");
          }

          // Transform backend response to match frontend User interface
          const user = {
            id: userData._id,
            email: userData.email,
            name: userData.username,
            role: "admin" as UserRole, // You may need to add role to your backend response
            createdAt: new Date(), // You may need to add this to your backend response
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (apiUrl) {
            // Call backend logout endpoint to clear cookies
            await fetch(`${apiUrl}/api/auth/logout`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
          }
        } catch (error) {
          // Continue with logout even if backend call fails
          console.warn("Backend logout failed:", error);
        }

        // Clear local state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      hasPermission: (requiredRoles: UserRole[]) => {
        const { user } = get();
        return user ? requiredRoles.includes(user.role) : false;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      }
    }
  )
);
