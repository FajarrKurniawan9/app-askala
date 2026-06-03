/**
 * Student Service — CRUD /students & /students/{id}
 * Activities and extracurriculars are embedded in student data (via PATCH).
 */
import api from "@/lib/api";
import type { ApiStudent } from "@/lib/types";

export interface CreateStudentPayload {
  nis: string;
  classRoom: string;   // Prisma field name
  userId: number;
  major?: string;      // Prisma field name
  grade?: string;
  address?: string;
  parentId?: string;
}

export interface UpdateStudentPayload {
  nis?: string;
  classRoom?: string;  // Prisma field name
  major?: string;      // Prisma field name
  grade?: string;
  address?: string;
  parentId?: string;
  // activities and extracurriculars are stored as nested data
  extracurriculars?: {
    name: string;
    role: string;
    coach?: string;
    since: string;
    isActive?: boolean;
  }[];
}

export const studentService = {
  async getAll(): Promise<ApiStudent[]> {
    const res = await api.get<ApiStudent[]>("/students");
    return res.data;
  },

  async getById(id: string): Promise<ApiStudent> {
    const res = await api.get<ApiStudent>(`/students/${id}`);
    return res.data;
  },

  async create(payload: CreateStudentPayload): Promise<ApiStudent> {
    const res = await api.post<ApiStudent>("/students", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateStudentPayload): Promise<ApiStudent> {
    const res = await api.patch<ApiStudent>(`/students/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};
