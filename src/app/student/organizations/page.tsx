"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { useAuthStore } from "@/store/authStore";
import { studentService } from "@/services/student.service";
import { toast } from "sonner";
import {
  Users, BookOpen, Plus, Edit2, Trash2, X,
  CheckCircle, Clock, Calendar, Loader2
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

interface LocalStudentOrg {
  id: string;
  studentId: string;
  orgName: string;
  role: string;
  since: string;
  isActive: boolean;
  description?: string;
}

interface LocalExtracurricular {
  id: string;
  name: string;
  role: string;
  coach?: string;
  since: string;
  isActive: boolean;
}

export default function OrganizationsPage() {
  const { setSidebarOpen } = useStudent();
  const { studentProfileId } = useAuthStore();

  const [tab, setTab] = useState<Tab>("orgs");
  const [loading, setLoading] = useState(true);

  // ─── Organizations state ──────────────────────────────────────
  const [orgs, setOrgs] = useState<LocalStudentOrg[]>([]);
  const [orgModal, setOrgModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selOrg, setSelOrg] = useState<LocalStudentOrg | null>(null);
  const [orgForm, setOrgForm] = useState({ orgName: "", role: "", since: "", description: "" });

  // ─── Eskul state ──────────────────────────────────────────────
  const [eskuls, setEskuls] = useState<LocalExtracurricular[]>([]);
  const [eskulModal, setEskulModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selEskul, setSelEskul] = useState<LocalExtracurricular | null>(null);
  const [eskulForm, setEskulForm] = useState({ name: "", role: "", coach: "", since: "" });

  // Load student & org data
  useEffect(() => {
    if (!studentProfileId) {
      setLoading(false);
      return;
    }

    studentService.getById(studentProfileId)
      .then((studentData) => {
        // Load extracurriculars
        const mappedEskuls: LocalExtracurricular[] = ((studentData as any).extracurriculars || []).map((ex: any, idx: number) => ({
          id: ex.id || `ex-${idx}`,
          name: ex.name,
          role: ex.role,
          coach: ex.coach,
          since: ex.since,
          isActive: ex.isActive !== false,
        }));
        setEskuls(mappedEskuls);

        // Load orgs
        const savedOrgs = localStorage.getItem(`askala_orgs_${studentProfileId}`);
        if (savedOrgs) {
          setOrgs(JSON.parse(savedOrgs));
        } else {
          setOrgs([
            { id: "o1", studentId: studentProfileId, orgName: "OSIS", role: "Ketua Divisi Hubungan Masyarakat", since: "2024-07-15", isActive: true, description: "Mengoordinasikan hubungan eksternal dan publikasi sekolah." },
          ]);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat organisasi dan eskul.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [studentProfileId]);

  // ── Org handlers ──────────────────────────────────────────────
  function openOrgAdd() { setOrgForm({ orgName: "", role: "", since: "", description: "" }); setSelOrg(null); setOrgModal("add"); }
  function openOrgEdit(o: LocalStudentOrg) { setSelOrg(o); setOrgForm({ orgName: o.orgName, role: o.role, since: o.since, description: o.description ?? "" }); setOrgModal("edit"); }
  function openOrgDelete(o: LocalStudentOrg) { setSelOrg(o); setOrgModal("delete"); }
  function closeOrg() { setOrgModal(null); setSelOrg(null); }

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentProfileId) return;

    let updatedOrgs = [...orgs];
    if (orgModal === "add") {
      const newOrg: LocalStudentOrg = {
        id: `so-${Date.now()}`,
        studentId: studentProfileId,
        orgName: orgForm.orgName,
        role: orgForm.role,
        since: orgForm.since,
        isActive: true,
        description: orgForm.description,
      };
      updatedOrgs = [newOrg, ...orgs];
      toast.success("Organisasi berhasil ditambahkan!");
    } else if (orgModal === "edit" && selOrg) {
      updatedOrgs = orgs.map(o => o.id === selOrg.id ? { ...o, ...orgForm } : o);
      toast.success("Data organisasi diperbarui!");
    }
    setOrgs(updatedOrgs);
    localStorage.setItem(`askala_orgs_${studentProfileId}`, JSON.stringify(updatedOrgs));
    closeOrg();
  }

  function handleOrgDelete() {
    if (!selOrg || !studentProfileId) return;
    const updatedOrgs = orgs.filter(o => o.id !== selOrg.id);
    setOrgs(updatedOrgs);
    localStorage.setItem(`askala_orgs_${studentProfileId}`, JSON.stringify(updatedOrgs));
    toast.success("Organisasi dihapus.");
    closeOrg();
  }

  // ── Eskul handlers ────────────────────────────────────────────
  function openEskulAdd() { setEskulForm({ name: "", role: "", coach: "", since: "" }); setSelEskul(null); setEskulModal("add"); }
  function openEskulEdit(e: LocalExtracurricular) { setSelEskul(e); setEskulForm({ name: e.name, role: e.role, coach: e.coach ?? "", since: e.since }); setEskulModal("edit"); }
  function openEskulDelete(e: LocalExtracurricular) { setSelEskul(e); setEskulModal("delete"); }
  function closeEskul() { setEskulModal(null); setSelEskul(null); }

  async function handleEskulSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentProfileId) return;

    try {
      let updatedEskuls = [...eskuls];
      if (eskulModal === "add") {
        const newEskul: LocalExtracurricular = {
          id: `ex-${Date.now()}`,
          name: eskulForm.name,
          role: eskulForm.role,
          coach: eskulForm.coach,
          since: eskulForm.since,
          isActive: true,
        };
        updatedEskuls = [newEskul, ...eskuls];
        toast.success("Eskul berhasil ditambahkan!");
      } else if (eskulModal === "edit" && selEskul) {
        updatedEskuls = eskuls.map(ex => ex.id === selEskul.id ? { ...ex, ...eskulForm } : ex);
        toast.success("Data eskul diperbarui!");
      }
      setEskuls(updatedEskuls);
      await studentService.update(studentProfileId, { extracurriculars: updatedEskuls });
      closeEskul();
    } catch {
      toast.error("Gagal menyimpan data eskul.");
    }
  }

  async function handleEskulDelete() {
    if (!selEskul || !studentProfileId) return;
    try {
      const updatedEskuls = eskuls.filter(ex => ex.id !== selEskul.id);
      setEskuls(updatedEskuls);
      await studentService.update(studentProfileId, { extracurriculars: updatedEskuls });
      toast.success("Eskul dihapus.");
      closeEskul();
    } catch {
      toast.error("Gagal menghapus data eskul.");
    }
  }

  if (loading) {
    return (
      <>
        <Topbar title="Organisasi & Eskul" subtitle="Kelola keanggotaan organisasi dan ekstrakurikuler" role="student" setSidebarOpen={setSidebarOpen} />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
          <Loader2 size={24} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "var(--text-muted)" }}>Memuat organisasi & eskul...</span>
        </main>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  return (
    <>
      <Topbar title="Organisasi & Eskul" subtitle="Kelola keanggotaan organisasi dan ekstrakurikuler" role="student" setSidebarOpen={setSidebarOpen} />

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

      {/* Org Modal */}
      {orgModal && (
        <div style={overlay} onClick={closeOrg}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{orgModal === "add" ? "Tambah" : "Edit"} Organisasi</h3>
            <form onSubmit={handleOrgSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Nama Organisasi *</label>
                <input className="form-input" required value={orgForm.orgName} onChange={e => setOrgForm({ ...orgForm, orgName: e.target.value })} placeholder="OSIS, Paskibra..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Jabatan *</label>
                  <input className="form-input" required value={orgForm.role} onChange={e => setOrgForm({ ...orgForm, role: e.target.value })} placeholder="Anggota / Ketua" />
                </div>
                <div>
                  <label className="form-label">Mulai Bergabung *</label>
                  <input type="date" className="form-input" required value={orgForm.since} onChange={e => setOrgForm({ ...orgForm, since: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Deskripsi Peran</label>
                <textarea className="form-input" rows={3} value={orgForm.description} onChange={e => setOrgForm({ ...orgForm, description: e.target.value })} placeholder="Jelaskan kontribusi Anda..." />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeOrg}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Org Delete Confirm */}
      {orgModal === "delete" && selOrg && (
        <div style={overlay} onClick={closeOrg}>
          <div style={{ ...modal, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Trash2 size={24} color="var(--danger)" /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Data Organisasi?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeOrg}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleOrgDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Eskul Modal */}
      {eskulModal && (
        <div style={overlay} onClick={closeEskul}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{eskulModal === "add" ? "Tambah" : "Edit"} Eskul</h3>
            <form onSubmit={handleEskulSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Nama Eskul *</label>
                <input className="form-input" required value={eskulForm.name} onChange={e => setEskulForm({ ...eskulForm, name: e.target.value })} placeholder="Futsal, Badminton..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Peran</label>
                  <input className="form-input" value={eskulForm.role} onChange={e => setEskulForm({ ...eskulForm, role: e.target.value })} placeholder="Anggota / Ketua" />
                </div>
                <div>
                  <label className="form-label">Pelatih / Pembina</label>
                  <input className="form-input" value={eskulForm.coach} onChange={e => setEskulForm({ ...eskulForm, coach: e.target.value })} placeholder="Nama Pelatih" />
                </div>
              </div>
              <div>
                <label className="form-label">Mulai Bergabung</label>
                <input type="date" className="form-input" value={eskulForm.since} onChange={e => setEskulForm({ ...eskulForm, since: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeEskul}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eskul Delete Confirm */}
      {eskulModal === "delete" && selEskul && (
        <div style={overlay} onClick={closeEskul}>
          <div style={{ ...modal, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Trash2 size={24} color="var(--danger)" /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Data Eskul?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeEskul}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleEskulDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
