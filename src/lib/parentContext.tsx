/**
 * ParentContext — shared sidebar state for all /parent/* pages.
 */
"use client";
import { createContext, useContext, useState } from "react";

interface ParentCtx {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const ParentContext = createContext<ParentCtx>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function ParentProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <ParentContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </ParentContext.Provider>
  );
}

export function useParent() {
  return useContext(ParentContext);
}
