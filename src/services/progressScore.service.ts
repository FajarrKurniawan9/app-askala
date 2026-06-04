/**
 * Progress Score Service — /progress-scores
 * Admin creates/updates monthly scores per student.
 * Used in parent dashboard line chart.
 */
import api from "@/lib/api";

export interface ApiProgressScore {
  id: string;
  month: number;    // 1–12
  year: number;
  score: number;    // 0–100
  studentId: string;
  student?: {
    id: string;
    nis: string;
    classRoom: string;
    user?: { firstName: string; lastName: string; email: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgressScorePayload {
  month: number;
  year: number;
  score: number;
  studentId: string;
}

export interface UpdateProgressScorePayload {
  month?: number;
  year?: number;
  score?: number;
}

export const progressScoreService = {
  async getAll(params?: { studentId?: string }): Promise<ApiProgressScore[]> {
    const res = await api.get<ApiProgressScore[]>("/progress-scores", { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiProgressScore> {
    const res = await api.get<ApiProgressScore>(`/progress-scores/${id}`);
    return res.data;
  },

  async create(payload: CreateProgressScorePayload): Promise<ApiProgressScore> {
    const res = await api.post<ApiProgressScore>("/progress-scores", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateProgressScorePayload): Promise<ApiProgressScore> {
    const res = await api.patch<ApiProgressScore>(`/progress-scores/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/progress-scores/${id}`);
  },
};
