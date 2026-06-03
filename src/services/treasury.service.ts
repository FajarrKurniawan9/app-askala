/**
 * Treasury Service — GET/POST /treasury, GET/PATCH/DELETE /treasury/:id
 * Handles organization cash flow (income IN / expense OUT).
 * Filter by orgId: GET /treasury?orgId=UUID
 */
import api from "@/lib/api";

export type TreasuryType = "IN" | "OUT";

export interface ApiTreasury {
  id: string;
  type: TreasuryType;
  title: string;
  amount: number;
  date: string;           // ISO date string
  description?: string;
  createdById: number;    // numeric user ID
  orgId: string;
  org?: { id: string; name: string; isActive: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreasuryPayload {
  type: TreasuryType;
  title: string;
  amount: number;
  date: string;
  orgId: string;
  createdById: number;
  description?: string;
}

export interface UpdateTreasuryPayload {
  type?: TreasuryType;
  title?: string;
  amount?: number;
  date?: string;
  orgId?: string;
  createdById?: number;
  description?: string;
}

export const treasuryService = {
  async getAll(params?: { orgId?: string }): Promise<ApiTreasury[]> {
    const res = await api.get<ApiTreasury[]>("/treasury", { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiTreasury> {
    const res = await api.get<ApiTreasury>(`/treasury/${id}`);
    return res.data;
  },

  async create(payload: CreateTreasuryPayload): Promise<ApiTreasury> {
    const res = await api.post<ApiTreasury>("/treasury", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateTreasuryPayload): Promise<ApiTreasury> {
    const res = await api.patch<ApiTreasury>(`/treasury/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/treasury/${id}`);
  },
};
