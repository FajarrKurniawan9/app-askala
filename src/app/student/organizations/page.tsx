"use client";
import { useState, useMemo } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { mockStudentOrgs, mockExtracurriculars } from "@/lib/mockData";
import type { StudentOrg, Extracurricular } from "@/lib/types";
import { toast } from "sonner";
import {
  Users, BookOpen, Plus, Edit2, Trash2, X,
  CheckCircle, Clock, Calendar,
} from "lucide-react";

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modal: React.CSSProperties = {
  width: "100%", maxWidth: 500, padding: 28, background: "#fff",
  borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,.15)",
  maxHeight: "90vh", overflowY: "auto",
};

type Tab = "orgs" | "eskul";

export default function OrganizationsPage() {
  const { setSidebarOpen } = useStudent();
  const [tab, setTab] = useState<Tab>("orgs");

  // ─── Organizations state ──────────────────────────────────────
  const [orgs, setOrgs] = useState<StudentOrg[]>(mockStudentOrgs);
  const [orgModal, setOrgModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selOrg, setSelOrg] = useState<StudentOrg | null>(null);
  const [orgForm, setOrgForm] = useState({ orgName: "", role: "", since: "", description: "" });

  // ─── Eskul state ──────────────────────────────────────────────
  const [eskuls, setEskuls] = useState<Extracurricular[]>(mockExtracurriculars);
  const [eskulModal, setEskulModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selEskul, setSelEskul] = useState<Extracurricular | null>(null);
  const [eskulForm, setEskulForm] = useState({ name: "", role: "", coach: "", since: "" });

  // ── Org handlers ──────────────────────────────────────────────
  function openOrgAdd() { setOrgForm({ orgName: "", role: "", since: "", description: "" }); setSelOrg(null); setOrgModal("add"); }
  function openOrgEdit(o: StudentOrg) { setSelOrg(o); setOrgForm({ orgName: o.orgName, role: o.role, since: o.since, description: o.description ?? "" }); setOrgModal("edit"); }
  function openOrgDelete(o: StudentOrg) { setSelOrg(o); setOrgModal("delete"); }
  function closeOrg() { setOrgModal(null); setSelOrg(null); }

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (orgModal === "add") {
      const newOrg: StudentOrg = {
        id: `so${Date.now()}`, studentId: "s1", orgName: orgForm.orgName,
        role: orgForm.role, since: orgForm.since, isActive: true,
        description: orgForm.description, createdAt: new Date().toISOString(),
      };
      setOrgs(prev => [newOrg, ...prev]);
      toast.success("Organisasi berhasil ditambahkan!");
    } else if (orgModal === "edit" && selOrg) {
      setOrgs(prev => prev.map(o => o.id === selOrg.id ? { ...o, ...orgForm } : o));
      toast.success("Data organisasi diperbarui!");
    }
    closeOrg();
  }

  function handleOrgDelete() {
    if (!selOrg) return;
    setOrgs(prev => prev.filter(o => o.id !== selOrg.id));
    toast.success("Organisasi dihapus.");
    closeOrg();
  }

  // ── Eskul handlers ────────────────────────────────────────────
  function openEskulAdd() { setEskulForm({ name: "", role: "", coach: "", since: "" }); setSelEskul(null); setEskulModal("add"); }
  function openEskulEdit(e: Extracurricular) { setSelEskul(e); setEskulForm({ name: e.name, role: e.role, coach: e.coach ?? "", since: e.since }); setEskulModal("edit"); }
  function openEskulDelete(e: Extracurricular) { setSelEskul(e); setEskulModal("delete"); }
  function closeEskul() { setEskulModal(null); setSelEskul(null); }

  function handleEskulSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (eskulModal === "add") {
      const newEskul: Extracurricular = {
        id: `ex${Date.now()}`, studentId: "s1", name: eskulForm.name,
        role: eskulForm.role, coach: eskulForm.coach, since: eskulForm.since,
        isActive: true, createdAt: new Date().toISOString(),
      };
      setEskuls(prev => [newEskul, ...prev]);
      toast.success("Eskul berhasil ditambahkan!");
    } else if (eskulModal === "edit" && selEskul) {
      setEskuls(prev => prev.map(ex => ex.id === selEskul.id ? { ...ex, ...eskulForm } : ex));
      toast.success("Data eskul diperbarui!");
    }
    closeEskul();
  }

  function handleEskulDelete() {
    if (!selEskul) return;
    setEskuls(prev => prev.filter(ex => ex.id !== selEskul.id));
    toast.success("Eskul dihapus.");
    closeEskul();
  }

  return (
    <>
      <Topbar
        title="Organisasi & Eskul"
        subtitle="Kelola keanggotaan organisasi dan ekstrakurikuler"
        role="student"
        setSidebarOpen={setSidebarOpen}
      />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
          {[
            { label: "Organisasi Aktif", value: orgs.filter(o => o.isActive).length, Icon: Users, color: "var(--primary)" },
            { label: "Eskul Aktif", value: eskuls.filter(e => e.isActive).length, Icon: BookOpen, color: "var(--warning)" },
            { label: "Total Organisasi", value: orgs.length, Icon: Users, color: "var(--success)" },
            { label: "Total Eskul", value: eskuls.length, Icon: BookOpen, color: "var(--text-muted)" },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="card-stat">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color }}>{value}</p>
                </div>
                <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
            {([["orgs", "🏛️ Organisasi"], ["eskul", "🎯 Eskul"]] as [Tab, string][]).map(([t, lbl]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer",
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "var(--primary)" : "var(--text-muted)",
                border: tab === t ? "1px solid var(--border)" : "none",
              }}>{lbl}</button>
            ))}
          </div>
          <button
            onClick={tab === "orgs" ? openOrgAdd : openEskulAdd}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <Plus size={14} /> {tab === "orgs" ? "Tambah Organisasi" : "Tambah Eskul"}
          </button>
        </div>

        {/* Organizations Grid */}
        {tab === "orgs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {orgs.map(o => (
              <div key={o.id} className="card" style={{ padding: 22, borderTop: `3px solid ${o.isActive ? "var(--primary)" : "var(--text-muted)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, background: "var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700 }}>{o.orgName}</h4>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.role}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openOrgEdit(o)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => openOrgDelete(o)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {o.description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>{o.description}</p>}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={11} /> Sejak {o.since}
                  </span>
                  <span className={`badge ${o.isActive ? "badge-success" : "badge-gray"}`}>
                    {o.isActive ? <><CheckCircle size={10} />Aktif</> : "Selesai"}
                  </span>
                </div>
              </div>
            ))}
            {orgs.length === 0 && (
              <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                <Users size={32} style={{ margin: "0 auto 10px", opacity: .3 }} />
                <p>Belum ada organisasi. Tambahkan sekarang!</p>
              </div>
            )}
          </div>
        )}

        {/* Eskul Grid */}
        {tab === "eskul" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {eskuls.map(ex => (
              <div key={ex.id} className="card" style={{ padding: 22, borderLeft: `4px solid ${ex.isActive ? "var(--warning)" : "var(--text-muted)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={18} color="var(--warning)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</h4>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{ex.role}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEskulEdit(ex)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => openEskulDelete(ex)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {ex.coach && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Pelatih: <strong>{ex.coach}</strong></p>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={11} /> Sejak {ex.since}
                  </span>
                  <span className={`badge ${ex.isActive ? "badge-warning" : "badge-gray"}`}>
                    {ex.isActive ? "Aktif" : "Selesai"}
                  </span>
                </div>
              </div>
            ))}
            {eskuls.length === 0 && (
              <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                <BookOpen size={32} style={{ margin: "0 auto 10px", opacity: .3 }} />
                <p>Belum ada eskul. Tambahkan sekarang!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Org Add/Edit Modal */}
      {(orgModal === "add" || orgModal === "edit") && (
        <div style={overlay} onClick={closeOrg}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{orgModal === "add" ? "Tambah Organisasi" : "Edit Organisasi"}</h3>
              <button onClick={closeOrg} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleOrgSubmit}>
              <div>
                <label className="form-label">Nama Organisasi *</label>
                <input className="form-input" required value={orgForm.orgName} onChange={e => setOrgForm(f => ({ ...f, orgName: e.target.value }))} placeholder="OSIS, Paskibra, KIR..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Jabatan *</label>
                  <input className="form-input" required value={orgForm.role} onChange={e => setOrgForm(f => ({ ...f, role: e.target.value }))} placeholder="Anggota / Ketua" />
                </div>
                <div>
                  <label className="form-label">Mulai Bergabung *</label>
                  <input type="date" className="form-input" required value={orgForm.since} onChange={e => setOrgForm(f => ({ ...f, since: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Deskripsi Peran</label>
                <textarea className="form-input" rows={3} value={orgForm.description} onChange={e => setOrgForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} placeholder="Tanggung jawab dan aktivitas..." />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeOrg}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  <Plus size={14} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Org Delete Modal */}
      {orgModal === "delete" && selOrg && (
        <div style={overlay} onClick={closeOrg}>
          <div style={{ ...modal, maxWidth: 380, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 54, height: 54, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Trash2 size={24} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Hapus Organisasi?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>
              <strong>{selOrg.orgName}</strong> akan dihapus secara permanen.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeOrg}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleOrgDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Eskul Add/Edit Modal */}
      {(eskulModal === "add" || eskulModal === "edit") && (
        <div style={overlay} onClick={closeEskul}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{eskulModal === "add" ? "Tambah Eskul" : "Edit Eskul"}</h3>
              <button onClick={closeEskul} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleEskulSubmit}>
              <div>
                <label className="form-label">Nama Eskul *</label>
                <input className="form-input" required value={eskulForm.name} onChange={e => setEskulForm(f => ({ ...f, name: e.target.value }))} placeholder="Futsal, Debate, Pramuka..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Peran / Posisi</label>
                  <input className="form-input" value={eskulForm.role} onChange={e => setEskulForm(f => ({ ...f, role: e.target.value }))} placeholder="Anggota" />
                </div>
                <div>
                  <label className="form-label">Pelatih</label>
                  <input className="form-input" value={eskulForm.coach} onChange={e => setEskulForm(f => ({ ...f, coach: e.target.value }))} placeholder="Nama pelatih" />
                </div>
              </div>
              <div>
                <label className="form-label">Mulai Bergabung</label>
                <input type="date" className="form-input" value={eskulForm.since} onChange={e => setEskulForm(f => ({ ...f, since: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeEskul}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  <Plus size={14} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eskul Delete Modal */}
      {eskulModal === "delete" && selEskul && (
        <div style={overlay} onClick={closeEskul}>
          <div style={{ ...modal, maxWidth: 380, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 54, height: 54, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Trash2 size={24} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Hapus Eskul?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>
              <strong>{selEskul.name}</strong> akan dihapus secara permanen.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeEskul}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleEskulDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
