/**
 * AdminContext — shared sidebar state for all /admin/* pages.
 * Layout provides the state; pages consume it via useAdmin().
 */
"use client";
import { createContext, useContext, useState } from "react";

interface AdminCtx {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AdminContext = createContext<AdminCtx>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AdminContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
