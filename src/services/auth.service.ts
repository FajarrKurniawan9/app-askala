/**
 * Auth Service — wraps API calls for auth endpoints.
 * When backend is ready, these functions will hit real endpoints.
 */
import api from "@/lib/api";

export interface LoginPayload  { email: string; password: string; }
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin" | "parent";
  nis?: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    // POST /api/auth/login
    const res = await api.post("/auth/login", payload);
    return res.data; // { user, token }
  },

  async register(payload: RegisterPayload) {
    // POST /api/auth/register
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  async logout() {
    // POST /api/auth/logout
    await api.post("/auth/logout").catch(() => null);
  },

  async me() {
    // GET /api/auth/me
    const res = await api.get("/auth/me");
    return res.data;
  },
};
