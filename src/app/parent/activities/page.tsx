"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import {
  Trophy, Calendar, MapPin, Users, Clock, CheckCircle, Flag, Star,
} from "lucide-react";
import { mockActivities, mockAchievements, mockStudentOrgs } from "@/lib/mockData";
import type { ActivityStatus } from "@/lib/types";

const STATUS_CFG: Record<ActivityStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  upcoming: { label: "Akan Datang", cls: "badge-warning", icon: <Clock size={10} /> },
  ongoing:  { label: "Berlangsung", cls: "badge-success", icon: <CheckCircle size={10} /> },
  done:     { label: "Selesai",     cls: "badge-gray",    icon: <Flag size={10} /> },
};

const STUDENT_ORGS = ["OSIS", "Paskibra", "KIR"];

export default function ParentActivitiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const relatedActivities = mockActivities.filter(a => STUDENT_ORGS.includes(a.organization));

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="parent" userName="Ibu Kartini" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar title="Aktivitas Anak" subtitle="Pantau kegiatan dan pencapaian Ahmad Rizky" role="parent" setSidebarOpen={setSidebarOpen} />

        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
            {[
              { label: "Prestasi Diraih", value: mockAchievements.length, Icon: Trophy },
              { label: "Organisasi Aktif", value: mockStudentOrgs.filter(o => o.isActive).length, Icon: Users },
              { label: "Kegiatan Diikuti", value: relatedActivities.length, Icon: Calendar },
              { label: "Akan Datang", value: relatedActivities.filter(a => a.status === "upcoming").length, Icon: Clock },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="card-stat">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                  </div>
                  <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color="var(--primary)" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Achievements */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Prestasi Terbaru</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Pencapaian Ahmad Rizky</p>
              </div>
              <span className="badge badge-primary"><Star size={11} />Top Performer</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mockAchievements.slice(0, 4).map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Trophy size={15} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{a.title}</p>
                    <div style={{ display: "flex", gap: 5 }}>
                      <span className="badge badge-primary" style={{ fontSize: 11 }}>{a.position}</span>
                      <span className="badge badge-gray" style={{ fontSize: 11 }}>{a.level}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={10} />{a.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Kegiatan Organisasi</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {relatedActivities.map(a => {
                const cfg = STATUS_CFG[a.status];
                const pct = Math.round((a.participants / a.maxParticipants) * 100);
                return (
                  <div key={a.id} className="card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span className="badge badge-primary" style={{ fontSize: 11 }}>{a.organization}</span>
                      <span className={`badge ${cfg.cls}`}>{cfg.icon}{cfg.label}</span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{a.name}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={11} color="var(--primary)" />{a.date}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                        <MapPin size={11} color="var(--primary)" />{a.location}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Peserta</span>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{a.participants}/{a.maxParticipants}</span>
                      </div>
                      <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "var(--primary)", borderRadius: 999 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Org Memberships */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Keanggotaan Organisasi</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mockStudentOrgs.map(o => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Users size={15} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{o.orgName}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.role} • Sejak {o.since}</p>
                  </div>
                  <span className={`badge ${o.isActive ? "badge-success" : "badge-gray"}`}>
                    {o.isActive ? <><CheckCircle size={10} />Aktif</> : "Selesai"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
