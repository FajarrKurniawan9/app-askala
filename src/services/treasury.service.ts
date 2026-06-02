/**
 * Treasury Service — organization cash flow CRUD.
 */
import api from "@/lib/api";
import type { Transaction } from "@/lib/types";

export const treasuryService = {
  async getAll(params?: { organization?: string; type?: string }) {
    const res = await api.get("/treasury", { params });
    return res.data as Transaction[];
  },

  async create(payload: Omit<Transaction, "id">) {
    const res = await api.post("/treasury", payload);
    return res.data as Transaction;
  },

  async update(id: string, payload: Partial<Transaction>) {
    const res = await api.put(`/treasury/${id}`, payload);
    return res.data as Transaction;
  },

  async remove(id: string) {
    await api.delete(`/treasury/${id}`);
  },
};
