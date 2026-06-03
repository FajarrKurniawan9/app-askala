/**
 * Activity Service — GET/POST /activities, GET/PATCH/DELETE /activities/:id
 * Activity log entries per student.
 * type: "Prestasi" | "Organisasi" | "Eskul" | "Pembayaran"
 * Filter by studentId: GET /activities?studentId=UUID
 */
import api from "@/lib/api";

export type ActivityType = "Prestasi" | "Organisasi" | "Eskul" | "Pembayaran";

export interface ApiActivity {
  id: string;
  title: string;
  type: ActivityType;
  description?: string;
  date: string;        // ISO date string
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

export interface CreateActivityPayload {
  title: string;
  type: ActivityType;
  studentId: string;
  description?: string;
  date?: string;
}

export interface UpdateActivityPayload {
  title?: string;
  type?: ActivityType;
  description?: string;
  date?: string;
}

export const activityService = {
  async getAll(params?: { studentId?: string }): Promise<ApiActivity[]> {
    const res = await api.get<ApiActivity[]>("/activities", { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiActivity> {
    const res = await api.get<ApiActivity>(`/activities/${id}`);
    return res.data;
  },

  async create(payload: CreateActivityPayload): Promise<ApiActivity> {
    const res = await api.post<ApiActivity>("/activities", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateActivityPayload): Promise<ApiActivity> {
    const res = await api.patch<ApiActivity>(`/activities/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  },
};
