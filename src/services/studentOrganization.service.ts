/**
 * Student Organization Service — /student-organizations
 * Manages student membership in school organizations.
 */
import api from "@/lib/api";

export interface ApiStudentOrganization {
  id: string;
  studentId: string;
  orgId: string;
  role: string;
  isActive: boolean;
  org?: { id: string; name: string; description?: string; isActive: boolean };
  student?: { id: string; nis: string; classRoom: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentOrganizationPayload {
  studentId: string;
  orgId: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateStudentOrganizationPayload {
  role?: string;
  isActive?: boolean;
}

export const studentOrgService = {
  async getAll(): Promise<ApiStudentOrganization[]> {
    const res = await api.get<ApiStudentOrganization[]>("/student-organizations");
    return res.data;
  },

  async getById(id: string): Promise<ApiStudentOrganization> {
    const res = await api.get<ApiStudentOrganization>(`/student-organizations/${id}`);
    return res.data;
  },

  async create(payload: CreateStudentOrganizationPayload): Promise<ApiStudentOrganization> {
    const res = await api.post<ApiStudentOrganization>("/student-organizations", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateStudentOrganizationPayload): Promise<ApiStudentOrganization> {
    const res = await api.patch<ApiStudentOrganization>(`/student-organizations/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/student-organizations/${id}`);
  },
};
