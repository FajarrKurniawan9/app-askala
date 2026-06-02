/**
 * Submission Service — CRUD /submissions & /submissions/{id}
 * Handles student payment proof uploads and admin verification.
 *
 * Verification flow (PATCH with status: "VERIFIED"):
 *   - verifiedBy is REQUIRED: numeric user ID as string
 *   - Automatically creates treasury income record for linked org
 *   - Appends verification activity log entry to student's timeline
 */
import api from "@/lib/api";
import type { ApiSubmission, SubmissionStatus } from "@/lib/types";

export interface CreateSubmissionPayload {
  billId: string;
  studentId: string;
  fileUrl: string;  // URL from /upload endpoint
  note?: string;
}

export interface UpdateSubmissionPayload {
  fileUrl?: string;
  note?: string;
  status?: SubmissionStatus;
  verifiedBy?: string; // required when status === "VERIFIED"
}

export const submissionService = {
  async getAll(): Promise<ApiSubmission[]> {
    const res = await api.get<ApiSubmission[]>("/submissions");
    return res.data;
  },

  async getById(id: string): Promise<ApiSubmission> {
    const res = await api.get<ApiSubmission>(`/submissions/${id}`);
    return res.data;
  },

  async create(payload: CreateSubmissionPayload): Promise<ApiSubmission> {
    const res = await api.post<ApiSubmission>("/submissions", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSubmissionPayload): Promise<ApiSubmission> {
    const res = await api.patch<ApiSubmission>(`/submissions/${id}`, payload);
    return res.data;
  },

  async verify(id: string, verifiedBy: string): Promise<ApiSubmission> {
    const res = await api.patch<ApiSubmission>(`/submissions/${id}`, {
      status: "VERIFIED",
      verifiedBy,
    });
    return res.data;
  },

  async reject(id: string, note: string): Promise<ApiSubmission> {
    const res = await api.patch<ApiSubmission>(`/submissions/${id}`, {
      status: "REJECTED",
      note,
    });
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/submissions/${id}`);
  },
};
