/**
 * Portfolio Service — achievements, organizations, extracurriculars.
 */
import api from "@/lib/api";
import type { Achievement, StudentOrg, Extracurricular } from "@/lib/types";

// ─── Achievements ─────────────────────────────────────────────
export const achievementService = {
  async getAll(studentId?: string) {
    const res = await api.get("/achievements", { params: { studentId } });
    return res.data as Achievement[];
  },
  async create(payload: Omit<Achievement, "id" | "createdAt">) {
    const res = await api.post("/achievements", payload);
    return res.data as Achievement;
  },
  async update(id: string, payload: Partial<Achievement>) {
    const res = await api.put(`/achievements/${id}`, payload);
    return res.data as Achievement;
  },
  async remove(id: string) {
    await api.delete(`/achievements/${id}`);
  },
  async uploadCertificate(id: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post(`/achievements/${id}/certificate`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data as { url: string };
  },
};

// ─── Student Organizations ────────────────────────────────────
export const orgService = {
  async getAll(studentId?: string) {
    const res = await api.get("/student-orgs", { params: { studentId } });
    return res.data as StudentOrg[];
  },
  async create(payload: Omit<StudentOrg, "id" | "createdAt">) {
    const res = await api.post("/student-orgs", payload);
    return res.data as StudentOrg;
  },
  async update(id: string, payload: Partial<StudentOrg>) {
    const res = await api.put(`/student-orgs/${id}`, payload);
    return res.data as StudentOrg;
  },
  async remove(id: string) {
    await api.delete(`/student-orgs/${id}`);
  },
};

// ─── Extracurriculars ─────────────────────────────────────────
export const eskulService = {
  async getAll(studentId?: string) {
    const res = await api.get("/extracurriculars", { params: { studentId } });
    return res.data as Extracurricular[];
  },
  async create(payload: Omit<Extracurricular, "id" | "createdAt">) {
    const res = await api.post("/extracurriculars", payload);
    return res.data as Extracurricular;
  },
  async update(id: string, payload: Partial<Extracurricular>) {
    const res = await api.put(`/extracurriculars/${id}`, payload);
    return res.data as Extracurricular;
  },
  async remove(id: string) {
    await api.delete(`/extracurriculars/${id}`);
  },
};
