"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { AdminProvider } from "@/lib/adminContext";

/**
 * Shared Admin Layout — provides Sidebar + AdminContext for all /admin/* pages.
 * Each child page renders its own <Topbar> and receives setSidebarOpen via context.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminProvider>
      <div style={{ display: "flex" }}>
        <Sidebar
          role="admin"
          userName="Budi Santoso"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="main-content" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </AdminProvider>
  );
}
