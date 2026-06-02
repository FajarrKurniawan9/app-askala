/**
 * Zustand Auth Store
 * Persists user/token in localStorage for page refreshes.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/types";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  nis?: string;
  kelas?: string;
  nip?: string;
  jabatan?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: (user, token) => {
        localStorage.setItem("askala_token", token);
        localStorage.setItem("askala_user", JSON.stringify(user));
        set({ user, token, isLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem("askala_token");
        localStorage.removeItem("askala_user");
        set({ user: null, token: null, isLoggedIn: false });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: "askala-auth",
      // Only persist user + token
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn }),
    }
  )
);
