/**
 * Axios instance — Askala API layer
 * Connects to https://askala-siakad-system-production.up.railway.app
 * All service files import this instance.
 */
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://askala-siakad-system-production.up.railway.app";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Attach JWT Bearer token on every request ──────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("askala_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Global response error handling ────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("askala_token");
      localStorage.removeItem("askala_user");
      localStorage.removeItem("askala-auth"); // Zustand persist key
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
