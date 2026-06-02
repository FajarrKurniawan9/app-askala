"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, LayoutDashboard, Trophy, CreditCard, Users,
  TrendingUp, Settings, LogOut,
  ChevronRight, User, FileText,
} from "lucide-react";
import { useAuthStore, getDisplayName } from "@/store/authStore";

type NavItem = { label: string; href: string; icon: React.ElementType };

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Portofolio", href: "/student/portfolio", icon: Trophy },
  { label: "Pembayaran", href: "/student/payments", icon: CreditCard },
  { label: "Prestasi", href: "/student/achievements", icon: TrendingUp },
  { label: "Organisasi", href: "/student/organizations", icon: Users },
  { label: "Profil", href: "/student/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Data Siswa", href: "/admin/students", icon: Users },
  { label: "Verifikasi Bayar", href: "/admin/payments", icon: CreditCard },
  { label: "Kas Organisasi", href: "/admin/treasury", icon: TrendingUp },
  { label: "Kegiatan", href: "/admin/activities", icon: FileText },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
];

const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: LayoutDashboard },
  { label: "Aktivitas Anak", href: "/parent/activities", icon: Trophy },
  { label: "Status Bayar", href: "/parent/payments", icon: CreditCard },
  { label: "Profil", href: "/parent/profile", icon: User },
];

const roleConfig = {
  student: { nav: studentNav, label: "Siswa", color: "var(--primary)", bg: "var(--primary-light)" },
  admin: { nav: adminNav, label: "Admin", color: "var(--danger)", bg: "var(--danger-light)" },
  parent: { nav: parentNav, label: "Orang Tua", color: "var(--warning)", bg: "var(--warning-light)" },
};

interface SidebarProps {
  role: "student" | "admin" | "parent";
  userName?: string; // optional override; defaults to authStore user
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export default function Sidebar({ role, userName: userNameProp, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const cfg = roleConfig[role];
  const { nav, label, color, bg } = cfg;
  const userName = userNameProp ?? getDisplayName(user);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
            zIndex: 39, display: "none",
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Logo */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, background: "var(--primary)",
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 20, color: "var(--primary)",
            }}>Askala</span>
          </Link>
          <button
            className="btn btn-ghost btn-sm sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            style={{ display: "none" }}
          >
            ✕
          </button>
        </div>

        {/* Role badge */}
        <div style={{ padding: "12px 16px 4px" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".08em", color: "var(--text-muted)", display: "block", marginBottom: 4,
          }}>
            PANEL
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: bg, color: color, borderRadius: 999,
            padding: "4px 12px", fontSize: 12, fontWeight: 700,
          }}>
            {label}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {nav.map(({ label: lbl, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link${isActive ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                {lbl}
                {isActive && (
                  <ChevronRight size={13} style={{ marginLeft: "auto", opacity: .6 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: "1px solid var(--border)", padding: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, marginBottom: 6,
          }}>
            <div style={{
              width: 34, height: 34, background: color,
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userName}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ color: "var(--danger)", marginTop: 2, background: "none", border: "none", width: "100%", cursor: "pointer", textAlign: "left" }}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
