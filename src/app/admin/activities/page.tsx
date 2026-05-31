"use client";
import { useState, useMemo } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  Plus, Calendar, MapPin, Users, X, Edit2, Eye,
  CheckCircle, Clock, Flag, Filter, ChevronRight,
} from "lucide-react";
import { mockActivities, mockOrganizations } from "@/lib/mockData";
import type { Activity, ActivityStatus } from "@/lib/types";

const STATUS_CFG: Record<ActivityStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  upcoming: { label: "Akan Datang", cls: "badge-warning",  icon: <Clock size={10} /> },
  ongoing:  { label: "Berlangsung", cls: "badge-success",  icon: <CheckCircle size={10} /> },
  done:     { label: "Selesai",     cls: "badge-gray",     icon: <Flag size={10} /> },
};

type FilterStatus = "all" | ActivityStatus;

function ActivityCard({ activity, onView, onEdit }: { activity: Activity; onView: () => void; onEdit: () => void }) {
  const cfg = STATUS_CFG[activity.status];
  const pct = Math.round((activity.participants / activity.maxParticipants) * 100);
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 0, overflow: "hidden", transition: "transform .15s, box-shadow .15s", cursor: "pointer" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: activity.status === "upcoming" ? "var(--warning)" : activity.status === "ongoing" ? "var(--success)" : "var(--text-muted)" }} />

      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <span className="badge badge-primary" style={{ fontSize: 11 }}>{activity.organization}</span>
          <span className={`badge ${cfg.cls}`}>{cfg.icon}{cfg.label}</span>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{activity.name}</h3>
        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, flex: 1 }}>{activity.description}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <Calendar size={12} color="var(--primary)" />
            {activity.date}{activity.endDate ? ` – ${activity.endDate}` : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <MapPin size={12} color="var(--primary)" />
            {activity.location}
          </div>
        </div>

        {/* Participant progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Peserta</span>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{activity.participants}/{activity.maxParticipants}</span>
          </div>
          <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 90 ? "var(--danger)" : "var(--primary)", borderRadius: 999, transition: "width .4s" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          <Users size={11} /> Koordinator: <strong>{activity.coordinator}</strong>
        </div>
      </div>

      <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <button onClick={onView} className="btn btn-ghost btn-sm" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Eye size={13} /> Detail
        </button>
        <button onClick={onEdit} className="btn btn-outline btn-sm" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Edit2 size={13} /> Edit
        </button>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [orgFilter,    setOrgFilter]    = useState("Semua");
  const [modal,        setModal]        = useState<"add" | "edit" | "view" | null>(null);
  const [selected,     setSelected]     = useState<Activity | null>(null);
  const [form, setForm] = useState({ name: "", org: "OSIS", description: "", date: "", location: "", maxParticipants: "30", coordinator: "" });

  const orgs = ["Semua", ...mockOrganizations.map(o => o.shortName)];

  const filtered = useMemo(() => {
    return mockActivities.filter(a => {
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchOrg    = orgFilter === "Semua" || a.organization === orgFilter;
      return matchStatus && matchOrg;
    });
  }, [statusFilter, orgFilter]);

  function openView(a: Activity)  { setSelected(a); setModal("view"); }
  function openEdit(a: Activity)  { setSelected(a); setModal("edit"); setForm({ name: a.name, org: a.organization, description: a.description, date: a.date, location: a.location, maxParticipants: String(a.maxParticipants), coordinator: a.coordinator }); }
  function openAdd()              { setSelected(null); setModal("add"); setForm({ name: "", org: "OSIS", description: "", date: "", location: "", maxParticipants: "30", coordinator: "" }); }
  function closeModal()           { setModal(null); setSelected(null); }

  const upcoming = mockActivities.filter(a => a.status === "upcoming").length;
  const ongoing  = mockActivities.filter(a => a.status === "ongoing").length;
  const done     = mockActivities.filter(a => a.status === "done").length;

  return (
    <>
      <Topbar title="Kegiatan" subtitle="Manajemen kegiatan organisasi siswa" role="admin" userName="Budi Santoso" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stat Cards ────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          {[
            { label: "Total Kegiatan",  value: mockActivities.length, cls: "",                  Icon: Flag },
            { label: "Akan Datang",     value: upcoming,              cls: "card-stat-warning",  Icon: Clock },
            { label: "Berlangsung",     value: ongoing,               cls: "card-stat-success",  Icon: CheckCircle },
            { label: "Selesai",         value: done,                  cls: "card-stat",           Icon: Flag },
          ].map(({ label, value, cls, Icon }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          {/* Status tabs */}
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
            {([["all","Semua"],["upcoming","Akan Datang"],["ongoing","Berlangsung"],["done","Selesai"]] as [FilterStatus,string][]).map(([v, lbl]) => (
              <button key={v} onClick={() => setStatusFilter(v)} style={{
                padding: "5px 14px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                background: statusFilter === v ? "#fff" : "transparent",
                color: statusFilter === v ? "var(--primary)" : "var(--text-muted)",
                border: statusFilter === v ? "1px solid var(--border)" : "none",
              }}>{lbl}</button>
            ))}
          </div>

          {/* Org filter */}
          <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
            className="form-input" style={{ fontSize: 13, cursor: "pointer", maxWidth: 150 }}>
            {orgs.map(o => <option key={o}>{o}</option>)}
          </select>

          <button onClick={openAdd} className="btn btn-primary btn-sm" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            <Plus size={14} /> Tambah Kegiatan
          </button>
        </div>

        {/* ── Grid of Cards ─────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: "center" }}>
            <Calendar size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)" }}>Tidak ada kegiatan ditemukan</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {filtered.map(a => (
              <ActivityCard key={a.id} activity={a} onView={() => openView(a)} onEdit={() => openEdit(a)} />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal: Add / Edit ─────────────────────────────────── */}
      {(modal === "add" || modal === "edit") && (
        <div style={overlayStyle} onClick={closeModal}>
          <div className="card" style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{modal === "add" ? "Tambah Kegiatan" : "Edit Kegiatan"}</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Lengkapi data kegiatan organisasi</p>
              </div>
              <button onClick={closeModal} style={closeBtn}><X size={18} /></button>
            </div>
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={e => { e.preventDefault(); closeModal(); }}>
              <div>
                <label className="form-label">Nama Kegiatan *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Pensi Sekolah 2026" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Organisasi</label>
                  <select className="form-input" value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))}>
                    {mockOrganizations.map(o => <option key={o.id}>{o.shortName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Koordinator</label>
                  <input className="form-input" value={form.coordinator} onChange={e => setForm(f => ({ ...f, coordinator: e.target.value }))} placeholder="Nama koordinator" />
                </div>
              </div>
              <div>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Deskripsi singkat kegiatan..." style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Tanggal Mulai *</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Maks. Peserta</label>
                  <input type="number" className="form-input" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Lokasi</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Contoh: Aula Utama SMA" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  <Plus size={14} /> {modal === "add" ? "Tambah Kegiatan" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: View Detail ────────────────────────────────── */}
      {modal === "view" && selected && (
        <div style={overlayStyle} onClick={closeModal}>
          <div className="card" style={{ ...modalStyle, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className={`badge ${STATUS_CFG[selected.status].cls}`}>{STATUS_CFG[selected.status].icon}{STATUS_CFG[selected.status].label}</span>
              <button onClick={closeModal} style={closeBtn}><X size={18} /></button>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selected.name}</h2>
            <span className="badge badge-primary" style={{ marginBottom: 14 }}>{selected.organization}</span>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.7 }}>{selected.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                ["Tanggal",      selected.date + (selected.endDate ? ` – ${selected.endDate}` : "")],
                ["Lokasi",       selected.location],
                ["Koordinator",  selected.coordinator],
                ["Peserta",      `${selected.participants} / ${selected.maxParticipants}`],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{lbl}</p>
                  <p style={{ fontSize: 14 }}>{val}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Progress Peserta</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{Math.round(selected.participants / selected.maxParticipants * 100)}%</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999 }}>
                <div style={{ height: "100%", width: `${selected.participants / selected.maxParticipants * 100}%`, background: "var(--primary)", borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => openEdit(selected)}>
                <Edit2 size={14} /> Edit Kegiatan
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalStyle: React.CSSProperties = { width: "100%", maxWidth: 540, padding: 28, position: "relative", maxHeight: "90vh", overflowY: "auto" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" };
