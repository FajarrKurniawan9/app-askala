"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import {
  Plus, Search, Eye, Trash2, X, Loader2,
  Flag, CheckCircle, Clock, Trophy, Users, BookOpen,
  CreditCard, ChevronLeft, ChevronRight, Calendar, Edit2,
} from "lucide-react";
import { activityService, type ApiActivity, type ActivityType } from "@/services/activity.service";
import { studentService } from "@/services/student.service";
import { toast } from "sonner";
import type { ApiStudent } from "@/lib/types";

type ModalMode   = "add" | "edit" | "view" | "delete" | null;
type FilterType  = "all" | ActivityType;
const PAGE_SIZE  = 12;

const TYPE_CFG: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  Prestasi:    { icon: Trophy,    color: "#0369a1", bg: "#e0f2fe" },
  Organisasi:  { icon: Users,     color: "#15803d", bg: "#dcfce7" },
  Eskul:       { icon: BookOpen,  color: "#b45309", bg: "#fef3c7" },
  Pembayaran:  { icon: CreditCard,color: "#7c3aed", bg: "#ede9fe" },
};

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)", borderTop: `3px solid ${accent}`, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: 42, height: 42, background: `${accent}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={accent} />
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const { setSidebarOpen } = useAdmin();

  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [students, setStudents]     = useState<ApiStudent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState<ModalMode>(null);
  const [selected, setSelected]     = useState<ApiActivity | null>(null);
  const [formError, setFormError]   = useState("");

  const emptyForm = { title: "", type: "Prestasi" as ActivityType, studentId: "", description: "", date: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState(emptyForm);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [acts, studs] = await Promise.all([activityService.getAll(), studentService.getAll()]);
      setActivities(acts);
      setStudents(studs);
    } catch {
      toast.error("Gagal memuat data aktivitas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activities.filter(a => {
      const studentName = a.student?.user ? `${a.student.user.firstName} ${a.student.user.lastName}`.toLowerCase() : "";
      const matchSearch = a.title.toLowerCase().includes(q) || studentName.includes(q);
      const matchType   = typeFilter === "all" || a.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter, activities]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, typeFilter]);

  // ── Modals ─────────────────────────────────────────────────
  function openAdd() { setForm(emptyForm); setFormError(""); setModal("add"); }
  function openEdit(a: ApiActivity) {
    setSelected(a);
    setForm({ title: a.title, type: a.type, studentId: a.studentId, description: a.description ?? "", date: a.date.split("T")[0] });
    setFormError("");
    setModal("edit");
  }
  function openView(a: ApiActivity)   { setSelected(a); setModal("view"); }
  function openDelete(a: ApiActivity) { setSelected(a); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); setFormError(""); }

  // ── CRUD ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Judul wajib diisi."); return; }
    if (!form.studentId)    { setFormError("Pilih siswa terlebih dahulu."); return; }
    setSaving(true);
    try {
      if (modal === "add") {
        const created = await activityService.create({
          title: form.title.trim(), type: form.type, studentId: form.studentId,
          description: form.description.trim() || undefined,
          date: new Date(form.date).toISOString(),
        });
        setActivities(prev => [created, ...prev]);
        toast.success("Aktivitas berhasil dicatat!");
      } else if (modal === "edit" && selected) {
        const updated = await activityService.update(selected.id, {
          title: form.title.trim(), type: form.type,
          description: form.description.trim() || undefined,
          date: new Date(form.date).toISOString(),
        });
        setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
        toast.success("Aktivitas berhasil diperbarui!");
      }
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? "Gagal menyimpan aktivitas.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await activityService.remove(selected.id);
      setActivities(prev => prev.filter(a => a.id !== selected.id));
      toast.success("Aktivitas berhasil dihapus.");
      closeModal();
    } catch {
      toast.error("Gagal menghapus aktivitas.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Log Aktivitas Siswa" subtitle="Pantau & catat seluruh aktivitas siswa" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          <StatCard label="Total Aktivitas" value={loading ? "—" : activities.length} icon={Flag}     accent="var(--primary)" />
          <StatCard label="Prestasi"        value={loading ? "—" : activities.filter(a => a.type === "Prestasi").length}   icon={Trophy}    accent="#0369a1" />
          <StatCard label="Organisasi"      value={loading ? "—" : activities.filter(a => a.type === "Organisasi").length} icon={Users}     accent="#15803d" />
          <StatCard label="Eskul"           value={loading ? "—" : activities.filter(a => a.type === "Eskul").length}      icon={BookOpen}  accent="#b45309" />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", background: "linear-gradient(to right,#fafbfc,#fff)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} placeholder="Cari judul atau nama siswa..." />
            </div>
            <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {([["all","Semua"],["Prestasi","Prestasi"],["Organisasi","Organisasi"],["Eskul","Eskul"],["Pembayaran","Bayar"]] as [FilterType, string][]).map(([v, lbl]) => (
                <button key={v} onClick={() => setTypeFilter(v)} style={{
                  padding: "5px 10px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: typeFilter === v ? "#fff" : "transparent",
                  color: typeFilter === v ? "var(--primary)" : "var(--text-muted)",
                  border: typeFilter === v ? "1px solid var(--border)" : "none",
                }}>{lbl}</button>
              ))}
            </div>
            <button onClick={openAdd} className="btn btn-primary btn-sm" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
              <Plus size={14} /> Catat Aktivitas
            </button>
          </div>

          <div style={{ padding: "7px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> aktivitas</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Aktivitas","Tipe","Siswa","Tanggal","Aksi"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)" }}>
                      <Loader2 size={20} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} /><span>Memuat aktivitas...</span>
                    </div>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <Flag size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .25 }} />
                    <p style={{ fontWeight: 600 }}>Tidak ada aktivitas ditemukan</p>
                  </td></tr>
                ) : paginated.map((a, idx) => {
                  const isEven = idx % 2 === 0;
                  const cfg = TYPE_CFG[a.type];
                  const Icon = cfg.icon;
                  const studentName = a.student?.user ? `${a.student.user.firstName} ${a.student.user.lastName}` : "—";
                  return (
                    <tr key={a.id} style={{ background: isEven ? "#fff" : "#fafbfc", borderBottom: "1px solid var(--border)", transition: "background .12s" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-light)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isEven ? "#fff" : "#fafbfc")}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, background: cfg.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={15} color={cfg.color} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{a.title}</p>
                            {a.description && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{a.type}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{studentName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.student?.nis ?? ""}</p>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{a.date.split("T")[0]}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => openView(a)}   style={actionBtn}><Eye size={13} /></button>
                          <button onClick={() => openEdit(a)}   style={actionBtn}><Edit2 size={13} /></button>
                          <button onClick={() => openDelete(a)} style={{ ...actionBtn, color: "var(--danger)" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > PAGE_SIZE && (
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafbfc" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong></span>
              <div style={{ display: "flex", gap: 4 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...pageBtn, opacity: page === 1 ? .4 : 1 }}><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return <button key={p} onClick={() => setPage(p)} style={{ ...pageBtn, background: p === page ? "var(--primary)" : "#fff", color: p === page ? "#fff" : "var(--text-body)", fontWeight: p === page ? 700 : 500 }}>{p}</button>;
                })}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ ...pageBtn, opacity: page === totalPages ? .4 : 1 }}><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Add/Edit */}
      {(modal === "add" || modal === "edit") && (
        <div style={overlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,var(--primary),#7C3AED)", padding: "22px 24px", borderRadius: "12px 12px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>{modal === "add" ? "Catat Aktivitas Baru" : "Edit Aktivitas"}</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Log aktivitas siswa di sistem</p>
                </div>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}><X size={18} /></button>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Judul Aktivitas *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Contoh: Juara 1 Olimpiade Matematika" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Tipe *</label>
                  <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ActivityType }))}>
                    {(["Prestasi","Organisasi","Eskul","Pembayaran"] as ActivityType[]).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tanggal *</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>
              {modal === "add" && (
                <div>
                  <label className="form-label">Siswa *</label>
                  <select className="form-input" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required>
                    <option value="">— Pilih Siswa —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.user?.firstName} {s.user?.lastName} ({s.nis})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} placeholder="Detail aktivitas (opsional)" />
              </div>
              {formError && <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>{formError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1.5, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
                  {saving ? "Menyimpan..." : modal === "add" ? "Catat Aktivitas" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View */}
      {modal === "view" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            {(() => { const cfg = TYPE_CFG[selected.type]; const Icon = cfg.icon; return (
              <>
                <div style={{ height: 5, background: `linear-gradient(90deg,${cfg.color},var(--primary))`, borderRadius: "12px 12px 0 0" }} />
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, background: cfg.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={22} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{selected.title}</h3>
                      <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{selected.type}</span>
                    </div>
                    <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
                  </div>
                  {selected.description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.6 }}>{selected.description}</p>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Siswa", selected.student?.user ? `${selected.student.user.firstName} ${selected.student.user.lastName}` : "—"],
                      ["NIS",   selected.student?.nis ?? "—"],
                      ["Kelas", selected.student?.classRoom ?? "—"],
                      ["Tanggal", selected.date.split("T")[0]],
                    ].map(([lbl, val]) => (
                      <div key={lbl} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{lbl}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 20, width: "100%", justifyContent: "center" }} onClick={closeModal}>Tutup</button>
                </div>
              </>
            ); })()}
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {modal === "delete" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 400, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={26} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Aktivitas?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              <strong>{selected.title}</strong> ({selected.type}) akan dihapus permanen.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} disabled={saving} onClick={handleDelete}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
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

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalBox: React.CSSProperties = { width: "100%", maxWidth: 500, background: "#fff", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,.18)", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" };
const actionBtn: React.CSSProperties = { background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" };
const pageBtn: React.CSSProperties = { minWidth: 32, height: 32, borderRadius: 6, border: "1px solid var(--border)", background: "#fff", color: "var(--text-body)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
