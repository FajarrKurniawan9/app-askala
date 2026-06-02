/**
 * Axios instance — Askala API layer
 * Replace NEXT_PUBLIC_API_URL in .env.local with your backend URL.
 * All service files import this instance.
 */
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("askala_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("askala_token");
      localStorage.removeItem("askala_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
