/**
 * Zustand Auth Store
 * Persists user/token in localStorage via zustand/persist middleware.
 * Also stores resolved studentProfileId / parentProfileId after login.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiUser, Role } from "@/lib/types";

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  isLoggedIn: boolean;
  studentProfileId: string | null;  // UUID of ApiStudent for logged-in STUDENT
  parentProfileId: string | null;   // UUID of ApiParent for logged-in PARENT
  login: (user: ApiUser, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<ApiUser>) => void;
  setToken: (token: string) => void;
  setStudentProfileId: (id: string) => void;
  setParentProfileId: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      studentProfileId: null,
      parentProfileId: null,

      login: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("askala_token", token);
        }
        set({ user, token, isLoggedIn: true, studentProfileId: null, parentProfileId: null });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("askala_token");
        }
        set({ user: null, token: null, isLoggedIn: false, studentProfileId: null, parentProfileId: null });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      setToken: (token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("askala_token", token);
        }
        set({ token });
      },

      setStudentProfileId: (id) => set({ studentProfileId: id }),
      setParentProfileId: (id) => set({ parentProfileId: id }),
    }),
    {
      name: "askala-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
        studentProfileId: state.studentProfileId,
        parentProfileId: state.parentProfileId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("askala_token", state.token);
        }
      },
    }
  )
);

// ─── Helper: display name from ApiUser ────────────────────────
export function getDisplayName(user: ApiUser | null): string {
  if (!user) return "Pengguna";
  return `${user.firstName} ${user.lastName}`.trim();
}

// ─── Helper: get role-based redirect path ─────────────────────
export function getRoleRedirect(role: Role): string {
  switch (role) {
    case "ADMIN":   return "/admin";
    case "STUDENT": return "/student";
    case "PARENT":  return "/parent";
    default:        return "/login";
  }
}
