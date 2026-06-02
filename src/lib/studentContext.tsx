"use client";
import { createContext, useContext, useState } from "react";

interface StudentCtx {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const StudentContext = createContext<StudentCtx>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <StudentContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  return useContext(StudentContext);
}
