/**
 * Upload Service — POST /upload
 * Uploads files to Supabase Storage via backend proxy.
 * Returns { fileUrl: string } — the public URL to store in submission records.
 */
import api from "@/lib/api";

export interface UploadResponse {
  fileUrl: string;
}

export const uploadService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<UploadResponse>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
