/**
 * Parent Service — GET /parents, /parents/{id}
 */
import api from "@/lib/api";
import type { ApiParent } from "@/lib/types";

export const parentService = {
  async getAll(): Promise<ApiParent[]> {
    const res = await api.get<ApiParent[]>("/parents");
    return res.data;
  },

  async getById(id: string): Promise<ApiParent> {
    const res = await api.get<ApiParent>(`/parents/${id}`);
    return res.data;
  },

  /** Get the parent profile for the currently logged-in user (by userId filter) */
  async getByUserId(userId: number): Promise<ApiParent | undefined> {
    const all = await parentService.getAll();
    return all.find((p) => p.userId === userId);
  },

  /**
   * Get display name for a parent record.
   * Handles cases where the backend may not include the nested `user` relation.
   */
  getDisplayName(p: ApiParent): string {
    if (p.user?.firstName || p.user?.lastName) {
      return `${p.user.firstName ?? ""} ${p.user.lastName ?? ""}`.trim();
    }
    if (p.user?.email) return p.user.email;
    return `Parent #${p.userId}`;
  },

  getEmail(p: ApiParent): string {
    return p.user?.email ?? `(userId: ${p.userId})`;
  },
};
