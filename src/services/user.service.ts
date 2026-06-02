/**
 * User Service — CRUD /users & /users/{id} (Admin only)
 */
import api from "@/lib/api";
import type { ApiUser } from "@/lib/types";

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "ADMIN" | "STUDENT" | "PARENT";
  phone?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export const userService = {
  async getAll(): Promise<ApiUser[]> {
    const res = await api.get<ApiUser[]>("/users");
    return res.data;
  },

  async getById(id: number): Promise<ApiUser> {
    const res = await api.get<ApiUser>(`/users/${id}`);
    return res.data;
  },

  async create(payload: CreateUserPayload): Promise<ApiUser> {
    const res = await api.post<ApiUser>("/users", payload);
    return res.data;
  },

  async update(id: number, payload: UpdateUserPayload): Promise<ApiUser> {
    const res = await api.patch<ApiUser>(`/users/${id}`, payload);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
