"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import {
  Plus, Trophy, Users, BookOpen, Upload, Calendar,
  Search, Trash2, Edit, Eye, Award, Filter,
} from "lucide-react";

const achievements = [
  { id: 1, title: "Juara 1 Olimpiade Matematika Kab.", type: "Akademik",  org: "Individu",  date: "10 Mei 2026",  cert: true },
  { id: 2, title: "Juara 2 Debat Bahasa Inggris",      type: "Akademik",  org: "Individu",  date: "20 Mar 2026",  cert: true },
  { id: 3, title: "Anggota OSIS Divisi Pendidikan",    type: "Organisasi",org: "OSIS",      date: "2 Jan 2026",   cert: false },
  { id: 4, title: "Pelatihan Kepemimpinan Nasional",   type: "Non-Akad",  org: "Paskibra",  date: "15 Feb 2026",  cert: true },
  { id: 5, title: "Juara 3 Lomba Karya Ilmiah",        type: "Akademik",  org: "KIR",       date: "8 Apr 2026",   cert: true },
];

const orgs = [
  { name: "OSIS",     role: "Anggota Divisi Pendidikan", since: "Jan 2026", color: "var(--primary)" },
  { name: "Paskibra", role: "Anggota Inti",              since: "Mar 2025", color: "var(--danger)" },
  { name: "KIR",      role: "Sekretaris",                since: "Jul 2025", color: "var(--warning)" },
];

const typeColor: Record<string, string> = {
  Akademik:   "badge-primary",
  Organisasi: "badge-success",
  "Non-Akad": "badge-warning",
};

export default function PortfolioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"achievements" | "orgs">("achievements");
  const [search, setSearch] = useState("");

  const filtered = achievements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" userName="Ahmad Rizky" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar title="Portofolio Digital" subtitle="Dokumentasi prestasi & organisasi Anda" role="student" setSidebarOpen={setSidebarOpen} />

        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Header actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 4 }}>
              {(["achievements", "orgs"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer",
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "var(--primary)" : "var(--text-muted)",
                  border: tab === t ? "1px solid var(--border)" : "none",
                  transition: "all .15s",
                  boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                }}>
                  {t === "achievements" ? "🏆 Prestasi" : "🏛️ Organisasi"}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={15} />
              {tab === "achievements" ? "Tambah Prestasi" : "Tambah Organisasi"}
            </button>
          </div>

          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {[
              { icon: Trophy, label: "Total Prestasi",    value: "5", color: "var(--primary)" },
              { icon: Users,  label: "Organisasi Aktif",  value: "3", color: "var(--success)" },
              { icon: Award,  label: "Sertifikat Upload", value: "4", color: "var(--warning)" },
              { icon: BookOpen,label:"Kegiatan Diikuti",  value: "23",color: "var(--primary)" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card" style={{ padding: 18, textAlign: "center" }}>
                <div style={{ width: 40, height: 40, background: `${color}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <Icon size={18} color={color} />
                </div>
                <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>

          {tab === "achievements" ? (
            /* Achievements Section */
            <div className="card">
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      placeholder="Cari prestasi..."
                      className="form-input"
                      style={{ paddingLeft: 36, paddingTop: 8, paddingBottom: 8 }}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Filter size={13} /> Filter
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, padding: 24 }}>
                {filtered.map((a) => (
                  <div key={a.id} style={{
                    border: "1px solid var(--border)", borderRadius: 10, padding: 20,
                    transition: "all .15s", cursor: "default",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trophy size={18} color="var(--primary)" />
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.4 }}>{a.title}</h4>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      <span className={`badge ${typeColor[a.type] || "badge-gray"}`}>{a.type}</span>
                      <span className="badge badge-gray">{a.org}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={10} /> {a.date}
                      </span>
                      {a.cert ? (
                        <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          <Eye size={11} /> Sertifikat ✓
                        </span>
                      ) : (
                        <button style={{
                          fontSize: 11, color: "var(--primary)", fontWeight: 600,
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          <Upload size={11} /> Upload Sertifikat
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add new card */}
                <div style={{
                  border: "2px dashed var(--border)", borderRadius: 10, padding: 20,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 10, cursor: "pointer",
                  transition: "border-color .15s, background .15s", minHeight: 180,
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                    (e.currentTarget as HTMLElement).style.background = "var(--primary-light)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <div style={{ width: 44, height: 44, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={22} color="var(--primary)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>Tambah Prestasi Baru</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>Upload sertifikat & isi detail prestasi</p>
                </div>
              </div>
            </div>
          ) : (
            /* Organizations Section */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {orgs.map((o) => (
                <div key={o.name} className="card" style={{ padding: 24, borderTop: `3px solid ${o.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, background: `${o.color}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users size={22} color={o.color} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{o.name}</h4>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.role}</p>
                    </div>
                  </div>
                  <div style={{ padding: "12px 0", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Bergabung</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{o.since}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }}>Detail</button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "7px 10px" }}><Edit size={13} /></button>
                  </div>
                </div>
              ))}
              {/* Add org */}
              <div style={{
                border: "2px dashed var(--border)", borderRadius: 12, padding: 24,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 10, cursor: "pointer", minHeight: 180, transition: "all .15s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                  (e.currentTarget as HTMLElement).style.background = "var(--primary-light)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Plus size={24} color="var(--primary)" />
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>Tambah Organisasi</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
