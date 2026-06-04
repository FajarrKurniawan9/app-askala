"use client";
import { useState, useEffect } from "react";
import { Bell, Menu, Search, ChevronDown, CheckCheck } from "lucide-react";
import { useAuthStore, getDisplayName } from "@/store/authStore";
import { notificationService, type ApiNotification } from "@/services/notification.service";

interface TopbarProps {
  title: string;
  subtitle?: string;
  role: "student" | "admin" | "parent";
  setSidebarOpen: (v: boolean) => void;
}

export default function Topbar({ title, subtitle, role, setSidebarOpen }: TopbarProps) {
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const { user, logout } = useAuthStore();
  const userName = getDisplayName(user);
  const unread = notifications.filter(n => !n.isRead).length;
  const roleColor = role === "admin" ? "var(--danger)" : role === "parent" ? "var(--warning)" : "var(--primary)";

  // Fetch notifications on mount
  useEffect(() => {
    if (!user) return;
    notificationService.getAll()
      .then(data => {
        // Filter hanya milik user yang login
        setNotifications(data.filter(n => n.userId === user.id).slice(0, 10));
      })
      .catch(() => {
        // Notifikasi tidak kritis — gagal diam-diam
      });
  }, [user?.id]);

  async function handleMarkAsRead(id: string) {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      // silent
    }
  }

  async function handleMarkAllRead() {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    await Promise.allSettled(unreadIds.map(id => notificationService.markAsRead(id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Baru saja";
    if (mins < 60) return `${mins} mnt lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
  }

  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid var(--border)",
      height: 64, display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16, position: "sticky", top: 0, zIndex: 30,
    }}>
      {/* Hamburger */}
      <button className="btn btn-ghost btn-sm topbar-menu-btn" onClick={() => setSidebarOpen(true)}
        style={{ display: "none" }} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{subtitle}</p>}
      </div>

      {/* Search */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }} className="topbar-search">
        <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
        <input type="text" placeholder="Cari..." style={{
          border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px 7px 36px",
          fontSize: 13, color: "var(--text-body)", background: "#f8fafc", width: 200, outline: "none",
        }}
          onFocus={e => (e.target.style.borderColor = "var(--primary)")}
          onBlur={e  => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button className="btn btn-ghost btn-sm" style={{ position: "relative" }} aria-label="Notifications"
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4, width: 8, height: 8,
              background: "var(--danger)", borderRadius: "50%", border: "1.5px solid #fff",
            }} />
          )}
        </button>

        {notifOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320,
            background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
            boxShadow: "var(--shadow-md)", zIndex: 50,
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Notifikasi</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {unread > 0 && <span className="badge badge-danger">{unread} baru</span>}
                {unread > 0 && (
                  <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                    <CheckCheck size={12} /> Baca semua
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <Bell size={24} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                Tidak ada notifikasi
              </div>
            ) : notifications.map((n, i) => (
              <div key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                style={{
                  padding: "12px 16px", cursor: "pointer",
                  borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
                  background: !n.isRead ? "rgba(2,126,116,.03)" : "transparent",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  transition: "background .12s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#f8fafc")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = !n.isRead ? "rgba(2,126,116,.03)" : "transparent")}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                  background: !n.isRead ? "var(--primary)" : "transparent",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "var(--text-body)", marginBottom: 3, lineHeight: 1.5 }}>{n.text}</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "none", border: "none", padding: "4px 8px", borderRadius: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            overflow: "hidden", background: roleColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 12,
          }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" key={user.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
            }
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }} className="topbar-name">{userName}</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {profileOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, width: 200,
            background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
            boxShadow: "var(--shadow-md)", zIndex: 50, overflow: "hidden",
          }}>
            {[
              { label: "Profil Saya", href: `/${role}/profile` },
              { label: "Pengaturan", href: `/${role}/settings` },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{
                display: "block", padding: "10px 16px", fontSize: 13,
                color: "var(--text-body)", textDecoration: "none", fontWeight: 400, transition: "background .12s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >{label}</a>
            ))}
            <button onClick={handleLogout} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "10px 16px", fontSize: 13, color: "var(--danger)",
              background: "none", border: "none", cursor: "pointer", fontWeight: 600, transition: "background .12s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#fef2f2")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              Keluar
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .topbar-menu-btn { display: flex !important; }
          .topbar-search { display: none !important; }
          .topbar-name { display: none !important; }
        }
      `}</style>
    </header>
  );
}
