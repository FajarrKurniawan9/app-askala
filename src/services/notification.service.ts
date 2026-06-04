/**
 * Notification Service — /notifications
 * Admin creates notifications per user.
 * Students/Parents can read their own notifications.
 */
import api from "@/lib/api";

export interface ApiNotification {
  id: string;
  text: string;
  isRead: boolean;
  type?: string;    // e.g. "payment", "achievement", "info"
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationPayload {
  text: string;
  userId: number;
  isRead?: boolean;
  type?: string;
}

export interface UpdateNotificationPayload {
  text?: string;
  isRead?: boolean;
  type?: string;
}

export const notificationService = {
  async getAll(): Promise<ApiNotification[]> {
    const res = await api.get<ApiNotification[]>("/notifications");
    return res.data;
  },

  async getById(id: string): Promise<ApiNotification> {
    const res = await api.get<ApiNotification>(`/notifications/${id}`);
    return res.data;
  },

  async create(payload: CreateNotificationPayload): Promise<ApiNotification> {
    const res = await api.post<ApiNotification>("/notifications", payload);
    return res.data;
  },

  async markAsRead(id: string): Promise<ApiNotification> {
    const res = await api.patch<ApiNotification>(`/notifications/${id}`, { isRead: true });
    return res.data;
  },

  async update(id: string, payload: UpdateNotificationPayload): Promise<ApiNotification> {
    const res = await api.patch<ApiNotification>(`/notifications/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
