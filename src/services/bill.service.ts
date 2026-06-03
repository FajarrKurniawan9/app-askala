/**
 * Bill Service — CRUD /bills & /bills/{id}
 * NOTE from Swagger: dueDate is REQUIRED by CreateBillDto
 */
import api from "@/lib/api";
import type { ApiBill } from "@/lib/types";

export interface CreateBillPayload {
  title: string;
  amount: number;   // positive integer, IDR
  dueDate: string;  // ISO date string — REQUIRED by backend
  description?: string;
  orgId?: string;   // UUID of linked organization
}

export interface UpdateBillPayload {
  title?: string;
  amount?: number;
  dueDate?: string;
  description?: string;
  orgId?: string;
}

export const billService = {
  async getAll(): Promise<ApiBill[]> {
    const res = await api.get<ApiBill[]>("/bills");
    return res.data;
  },

  async getById(id: string): Promise<ApiBill> {
    const res = await api.get<ApiBill>(`/bills/${id}`);
    return res.data;
  },

  async create(payload: CreateBillPayload): Promise<ApiBill> {
    const res = await api.post<ApiBill>("/bills", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateBillPayload): Promise<ApiBill> {
    const res = await api.patch<ApiBill>(`/bills/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/bills/${id}`);
  },
};
