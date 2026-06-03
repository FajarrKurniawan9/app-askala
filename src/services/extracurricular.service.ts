/**
 * Extracurricular Service — /extracurriculars
 * Manages student extracurricular enrollments.
 */
import api from "@/lib/api";

export interface ApiExtracurricular {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  studentId: string;
  student?: { id: string; nis: string; classRoom: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExtracurricularPayload {
  name: string;
  studentId: string;
  description?: string;
  schedule?: string;
}

export interface UpdateExtracurricularPayload {
  name?: string;
  description?: string;
  schedule?: string;
}

export const extracurricularService = {
  async getAll(): Promise<ApiExtracurricular[]> {
    const res = await api.get<ApiExtracurricular[]>("/extracurriculars");
    return res.data;
  },

  async getById(id: string): Promise<ApiExtracurricular> {
    const res = await api.get<ApiExtracurricular>(`/extracurriculars/${id}`);
    return res.data;
  },

  async create(payload: CreateExtracurricularPayload): Promise<ApiExtracurricular> {
    const res = await api.post<ApiExtracurricular>("/extracurriculars", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateExtracurricularPayload): Promise<ApiExtracurricular> {
    const res = await api.patch<ApiExtracurricular>(`/extracurriculars/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/extracurriculars/${id}`);
  },
};
