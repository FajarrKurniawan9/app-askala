"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

/**
 * Shared Admin Layout
 * Provides the Sidebar for all /admin/* pages.
 * Each child page renders its own <Topbar> for custom title & subtitle.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        role="admin"
        userName="Budi Santoso"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content" style={{ flex: 1, minWidth: 0 }}>
        {/* Each page clones setSidebarOpen via its own Topbar call */}
        {children}
      </div>
    </div>
  );
}
