/**
 * Auth Service — POST /auth/login, /auth/register, /auth/me, /auth/logout
 */
import api from "@/lib/api";
import type { LoginResponse, RegisterResponse, ApiUser } from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "ADMIN" | "STUDENT" | "PARENT";
  phone?: string;
  nis?: string; // ← tambahan: Nomor Induk Siswa (opsional, hanya dikirim saat role STUDENT)
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const res = await api.post<RegisterResponse>("/auth/register", payload);
    return res.data;
  },

  async me(): Promise<ApiUser> {
    const res = await api.get<ApiUser>("/auth/me");
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout").catch(() => null);
  },
};