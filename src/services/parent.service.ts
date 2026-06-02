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
};
