"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@zoo.com",
    name: "John Admin",
    role: "admin",
    avatar: "/avatars/admin.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "2",
    email: "doctor@zoo.com",
    name: "Dr. Sarah Wilson",
    role: "doctor",
    avatar: "/avatars/doctor.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "3",
    email: "caretaker@zoo.com",
    name: "Mike Caretaker",
    role: "caretaker",
    avatar: "/avatars/caretaker.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Find user by email (in real app, this would be server-side)
          const user = mockUsers.find((u) => u.email === email);

          if (!user) {
            throw new Error("Invalid credentials");
          }

          // In real app, password would be verified server-side
          if (password !== "password123") {
            throw new Error("Invalid credentials");
          }

          // Update last login
          user.lastLogin = new Date();

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

      logout: () => {
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
    }
  )
);
