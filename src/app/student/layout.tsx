"use client";
import Sidebar from "@/components/layout/Sidebar";
import { StudentProvider, useStudent } from "@/lib/studentContext";

function StudentInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useStudent();
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        role="student"
        userName="Ahmad Rizky"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentProvider>
      <StudentInner>{children}</StudentInner>
    </StudentProvider>
  );
}
