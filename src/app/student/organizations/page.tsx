"use client";
import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { useAuthStore } from "@/store/authStore";
import { studentOrgService, type ApiStudentOrganization } from "@/services/studentOrganization.service";
import { extracurricularService, type ApiExtracurricular } from "@/services/extracurricular.service";
import { orgService } from "@/services/portfolio.service";
import { toast } from "sonner";
import {
  Users, BookOpen, Plus, Edit2, Trash2, X,
  CheckCircle, Clock, Calendar, Loader2,
} from "lucide-react";
import type { ApiOrganization } from "@/lib/types";

type Tab = "orgs" | "eskul";

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modalStyle: React.CSSProperties = {
  width: "100%", maxWidth: 500, padding: 28, background: "#fff",
  borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,.15)",
  maxHeight: "90vh", overflowY: "auto",
};

export default function OrganizationsPage() {
  const { setSidebarOpen } = useStudent();
  const { studentProfileId } = useAuthStore();

  const [tab, setTab]         = useState<Tab>("orgs");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [allOrgs, setAllOrgs] = useState<ApiOrganization[]>([]);

  // ── Student Orgs state ────────────────────────────────────
  const [orgs, setOrgs]           = useState<ApiStudentOrganization[]>([]);
  const [orgModal, setOrgModal]   = useState<"add" | "edit" | "delete" | null>(null);
  const [selOrg, setSelOrg]       = useState<ApiStudentOrganization | null>(null);
  const [orgForm, setOrgForm]     = useState({ orgId: "", role: "", isActive: true });

  // ── Eskul state ───────────────────────────────────────────
  const [eskuls, setEskuls]           = useState<ApiExtracurricular[]>([]);
  const [eskulModal, setEskulModal]   = useState<"add" | "edit" | "delete" | null>(null);
  const [selEskul, setSelEskul]       = useState<ApiExtracurricular | null>(null);
  const [eskulForm, setEskulForm]     = useState({ name: "", description: "", schedule: "" });

  // ── Fetch ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!studentProfileId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [allStudentOrgs, allEskuls, allAvailOrgs] = await Promise.all([
        studentOrgService.getAll(),
        extracurricularService.getAll(),
        orgService.getAll(),
      ]);
      // Filter only this student's records
      setOrgs(allStudentOrgs.filter(o => o.studentId === studentProfileId));
      setEskuls(allEskuls.filter(e => e.studentId === studentProfileId));
      setAllOrgs(allAvailOrgs.filter(o => o.isActive));
    } catch {
      toast.error("Gagal memuat organisasi & eskul.");
    } finally {
      setLoading(false);
    }
  }, [studentProfileId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Org handlers ──────────────────────────────────────────
  function openOrgAdd() { setOrgForm({ orgId: "", role: "", isActive: true }); setSelOrg(null); setOrgModal("add"); }
  function openOrgEdit(o: ApiStudentOrganization) {
    setSelOrg(o);
    setOrgForm({ orgId: o.orgId, role: o.role, isActive: o.isActive });
    setOrgModal("edit");
  }
  function openOrgDelete(o: ApiStudentOrganization) { setSelOrg(o); setOrgModal("delete"); }
  function closeOrg() { setOrgModal(null); setSelOrg(null); }

  async function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentProfileId) return;
    if (!orgForm.orgId) { toast.error("Pilih organisasi terlebih dahulu."); return; }
    setSaving(true);
    try {
      if (orgModal === "add") {
        const created = await studentOrgService.create({
          studentId: studentProfileId,
          orgId: orgForm.orgId,
          role: orgForm.role,
          isActive: orgForm.isActive,
        });
        setOrgs(prev => [created, ...prev]);
        toast.success("Berhasil bergabung ke organisasi!");
      } else if (orgModal === "edit" && selOrg) {
        const updated = await studentOrgService.update(selOrg.id, {
          role: orgForm.role,
          isActive: orgForm.isActive,
        });
        setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
        toast.success("Data organisasi diperbarui!");
      }
      closeOrg();
    } catch {
      toast.error("Gagal menyimpan data organisasi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleOrgDelete() {
    if (!selOrg) return;
    setSaving(true);
    try {
      await studentOrgService.remove(selOrg.id);
      setOrgs(prev => prev.filter(o => o.id !== selOrg.id));
      toast.success("Data organisasi dihapus.");
      closeOrg();
    } catch {
      toast.error("Gagal menghapus data organisasi.");
    } finally {
      setSaving(false);
    }
  }

  // ── Eskul handlers ────────────────────────────────────────
  function openEskulAdd() { setEskulForm({ name: "", description: "", schedule: "" }); setSelEskul(null); setEskulModal("add"); }
  function openEskulEdit(e: ApiExtracurricular) {
    setSelEskul(e);
    setEskulForm({ name: e.name, description: e.description ?? "", schedule: e.schedule ?? "" });
    setEskulModal("edit");
  }
  function openEskulDelete(e: ApiExtracurricular) { setSelEskul(e); setEskulModal("delete"); }
  function closeEskul() { setEskulModal(null); setSelEskul(null); }

  async function handleEskulSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentProfileId) return;
    if (!eskulForm.name.trim()) { toast.error("Nama eskul wajib diisi."); return; }
    setSaving(true);
    try {
      if (eskulModal === "add") {
        const created = await extracurricularService.create({
          name: eskulForm.name.trim(),
          studentId: studentProfileId,
          description: eskulForm.description.trim() || undefined,
          schedule: eskulForm.schedule.trim() || undefined,
        });
        setEskuls(prev => [created, ...prev]);
        toast.success("Eskul berhasil ditambahkan!");
      } else if (eskulModal === "edit" && selEskul) {
        const updated = await extracurricularService.update(selEskul.id, {
          name: eskulForm.name.trim(),
          description: eskulForm.description.trim() || undefined,
          schedule: eskulForm.schedule.trim() || undefined,
        });
        setEskuls(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
        toast.success("Data eskul diperbarui!");
      }
      closeEskul();
    } catch {
      toast.error("Gagal menyimpan data eskul.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEskulDelete() {
    if (!selEskul) return;
    setSaving(true);
    try {
      await extracurricularService.remove(selEskul.id);
      setEskuls(prev => prev.filter(e => e.id !== selEskul.id));
      toast.success("Eskul dihapus.");
      closeEskul();
    } catch {
      toast.error("Gagal menghapus eskul.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <>
      <Topbar title="Organisasi & Eskul" subtitle="Kelola keanggotaan organisasi dan ekstrakurikuler" role="student" setSidebarOpen={setSidebarOpen} />
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <Loader2 size={24} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "var(--text-muted)" }}>Memuat organisasi & eskul...</span>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );

  return (
    <>
      <Topbar title="Organisasi & Eskul" subtitle="Kelola keanggotaan organisasi dan ekstrakurikuler" role="student" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
          {[
            { label: "Organisasi Aktif", value: orgs.filter(o => o.isActive).length,  Icon: Users,     color: "var(--primary)" },
            { label: "Eskul Aktif",      value: eskuls.length,                         Icon: BookOpen,  color: "var(--warning)" },
            { label: "Total Organisasi", value: orgs.length,                           Icon: Users,     color: "var(--success)" },
            { label: "Total Eskul",      value: eskuls.length,                         Icon: BookOpen,  color: "var(--text-muted)" },
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
          <button onClick={tab === "orgs" ? openOrgAdd : openEskulAdd} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
                      <h4 style={{ fontSize: 15, fontWeight: 700 }}>{o.org?.name ?? "Organisasi"}</h4>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.role}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openOrgEdit(o)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => openOrgDelete(o)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {o.org?.description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>{o.org.description}</p>}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={11} /> Bergabung {o.createdAt.split("T")[0]}
                  </span>
                  <span className={`badge ${o.isActive ? "badge-success" : "badge-gray"}`}>
                    {o.isActive ? <><CheckCircle size={10} />Aktif</> : "Selesai"}
                  </span>
                </div>
              </div>
            ))}
            {orgs.length === 0 && (
              <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>
                <Users size={32} style={{ margin: "0 auto 10px", opacity: .3 }} />
                <p>Belum bergabung di organisasi apapun.</p>
              </div>
            )}
          </div>
        )}

        {/* Eskul Grid */}
        {tab === "eskul" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {eskuls.map(ex => (
              <div key={ex.id} className="card" style={{ padding: 22, borderLeft: "4px solid var(--warning)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={18} color="var(--warning)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</h4>
                      {ex.schedule && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{ex.schedule}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEskulEdit(ex)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => openEskulDelete(ex)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {ex.description && <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{ex.description}</p>}
              </div>
            ))}
            {eskuls.length === 0 && (
              <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>
                <BookOpen size={32} style={{ margin: "0 auto 10px", opacity: .3 }} />
                <p>Belum ada eskul yang terdaftar.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Org Modal */}
      {orgModal && orgModal !== "delete" && (
        <div style={overlay} onClick={closeOrg}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{orgModal === "add" ? "Tambah" : "Edit"} Organisasi</h3>
            <form onSubmit={handleOrgSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {orgModal === "add" && (
                <div>
                  <label className="form-label">Pilih Organisasi *</label>
                  <select className="form-input" value={orgForm.orgId} onChange={e => setOrgForm(f => ({ ...f, orgId: e.target.value }))} required>
                    <option value="">— Pilih Organisasi —</option>
                    {allOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="form-label">Jabatan *</label>
                <input className="form-input" required value={orgForm.role} onChange={e => setOrgForm(f => ({ ...f, role: e.target.value }))} placeholder="Anggota / Ketua / Sekretaris" />
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" id="isActive" checked={orgForm.isActive} onChange={e => setOrgForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--primary)" }} />
                <label htmlFor="isActive" style={{ fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Masih aktif sebagai anggota</label>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeOrg}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orgModal === "delete" && selOrg && (
        <div style={overlay} onClick={closeOrg}>
          <div style={{ ...modalStyle, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Trash2 size={24} color="var(--danger)" /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Organisasi?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Keanggotaan di <strong>{selOrg.org?.name}</strong> akan dihapus.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeOrg}>Batal</button>
              <button disabled={saving} className="btn btn-danger" style={{ flex: 1 }} onClick={handleOrgDelete}>
                {saving ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eskul Modal */}
      {eskulModal && eskulModal !== "delete" && (
        <div style={overlay} onClick={closeEskul}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{eskulModal === "add" ? "Tambah" : "Edit"} Eskul</h3>
            <form onSubmit={handleEskulSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Nama Eskul *</label>
                <input className="form-input" required value={eskulForm.name} onChange={e => setEskulForm(f => ({ ...f, name: e.target.value }))} placeholder="Futsal, Paskibra, KIR..." />
              </div>
              <div>
                <label className="form-label">Jadwal</label>
                <input className="form-input" value={eskulForm.schedule} onChange={e => setEskulForm(f => ({ ...f, schedule: e.target.value }))} placeholder="Setiap Rabu 15:00 WIB" />
              </div>
              <div>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={2} value={eskulForm.description} onChange={e => setEskulForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeEskul}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eskulModal === "delete" && selEskul && (
        <div style={overlay} onClick={closeEskul}>
          <div style={{ ...modalStyle, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Trash2 size={24} color="var(--danger)" /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Eskul?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}><strong>{selEskul.name}</strong> akan dihapus.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeEskul}>Batal</button>
              <button disabled={saving} className="btn btn-danger" style={{ flex: 1 }} onClick={handleEskulDelete}>
                {saving ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
