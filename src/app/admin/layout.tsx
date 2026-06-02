"use client";
import Sidebar from "@/components/layout/Sidebar";
import { AdminProvider, useAdmin } from "@/lib/adminContext";
import { useAuthStore, getDisplayName } from "@/store/authStore";

function AdminInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAdmin();
  const { user } = useAuthStore();
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        role="admin"
        userName={getDisplayName(user)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminInner>{children}</AdminInner>
    </AdminProvider>
  );
}
