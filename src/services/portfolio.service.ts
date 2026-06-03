/**
 * Portfolio Service — achievements & organizations
 * Achievements: POST/GET/PATCH/DELETE /achievements
 * Organizations: POST/GET/PATCH/DELETE /organizations
 * Extracurriculars: stored via studentService.update() on /students/{id}
 */
import api from "@/lib/api";
import type { ApiAchievement, ApiOrganization, AchievementType, AchievementLevel } from "@/lib/types";

// ─── Achievements ─────────────────────────────────────────────

export interface CreateAchievementPayload {
  studentId: string;
  title: string;
  type: AchievementType;        // "AKADEMIK" | "ORGANISASI" | "NON_AKADEMIK"
  level: AchievementLevel;      // "SEKOLAH" | "KABUPATEN" | "PROVINSI" | "NASIONAL" | "INTERNASIONAL"
  position: string;
  organizer: string;
  date: string;                 // ISO date string YYYY-MM-DD
  description?: string;
  certificateUrl?: string;
}

export interface UpdateAchievementPayload {
  title?: string;
  type?: AchievementType;
  level?: AchievementLevel;
  position?: string;
  organizer?: string;
  date?: string;
  description?: string;
  certificateUrl?: string;
  isVerified?: boolean;         // admin sets to true to officially verify
}

export const achievementService = {
  async getAll(params?: { studentId?: string }): Promise<ApiAchievement[]> {
    const res = await api.get<ApiAchievement[]>("/achievements", { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiAchievement> {
    const res = await api.get<ApiAchievement>(`/achievements/${id}`);
    return res.data;
  },

  async create(payload: CreateAchievementPayload): Promise<ApiAchievement> {
    const res = await api.post<ApiAchievement>("/achievements", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateAchievementPayload): Promise<ApiAchievement> {
    const res = await api.patch<ApiAchievement>(`/achievements/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/achievements/${id}`);
  },
};

// ─── Organizations ─────────────────────────────────────────────

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  description?: string;
  isActive?: boolean;          // false to deactivate without deleting
}

export const orgService = {
  async getAll(): Promise<ApiOrganization[]> {
    const res = await api.get<ApiOrganization[]>("/organizations");
    return res.data;
  },

  async getById(id: string): Promise<ApiOrganization> {
    const res = await api.get<ApiOrganization>(`/organizations/${id}`);
    return res.data;
  },

  async create(payload: CreateOrganizationPayload): Promise<ApiOrganization> {
    const res = await api.post<ApiOrganization>("/organizations", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateOrganizationPayload): Promise<ApiOrganization> {
    const res = await api.patch<ApiOrganization>(`/organizations/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },
};
