"use client";
import Sidebar from "@/components/layout/Sidebar";
import { ParentProvider, useParent } from "@/lib/parentContext";
import { useAuthStore, getDisplayName } from "@/store/authStore";

function ParentInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useParent();
  const { user } = useAuthStore();
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        role="parent"
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

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentProvider>
      <ParentInner>{children}</ParentInner>
    </ParentProvider>
  );
}
