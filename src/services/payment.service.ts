/**
 * Payment Service — student payments + admin verification.
 */
import api from "@/lib/api";
import type { Payment } from "@/lib/types";

export const paymentService = {
  async getAll(params?: { studentId?: string; status?: string }) {
    const res = await api.get("/payments", { params });
    return res.data as Payment[];
  },

  async uploadProof(paymentId: string, file: File) {
    const fd = new FormData();
    fd.append("proof", file);
    const res = await api.post(`/payments/${paymentId}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data as Payment;
  },

  async verify(paymentId: string) {
    const res = await api.put(`/payments/${paymentId}/verify`);
    return res.data as Payment;
  },

  async reject(paymentId: string, notes: string) {
    const res = await api.put(`/payments/${paymentId}/reject`, { notes });
    return res.data as Payment;
  },

  async create(payload: Omit<Payment, "id" | "status" | "createdAt">) {
    const res = await api.post("/payments", payload);
    return res.data as Payment;
  },
};
