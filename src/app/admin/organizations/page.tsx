"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import {
  Plus, Search, Eye, Edit2, Trash2, X,
  Loader2, Users, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Building2, AlignLeft,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { orgService } from "@/services/portfolio.service";
import type { CreateOrganizationPayload, UpdateOrganizationPayload } from "@/services/portfolio.service";
import { toast } from "sonner";
import type { ApiOrganization } from "@/lib/types";

type ModalMode = "add" | "edit" | "view" | "delete" | null;
const PAGE_SIZE = 10;

// ─── Org Avatar — unique color per name ──────────────────────
function OrgAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const palette = [
    { bg: "#e0f2fe", color: "#0369a1" },
    { bg: "#dcfce7", color: "#15803d" },
    { bg: "#ede9fe", color: "#7c3aed" },
    { bg: "#fef3c7", color: "#b45309" },
    { bg: "#fee2e2", color: "#dc2626" },
    { bg: "#fce7f3", color: "#be185d" },
    { bg: "#e6f4f3", color: "#027E74" },
  ];
  const p = palette[name.charCodeAt(0) % palette.length];
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: p.bg, color: p.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.3, flexShrink: 0,
      border: `1.5px solid ${p.color}20`,
    }}>{initials}</div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "18px 20px",
      border: "1px solid var(--border)", borderTop: `3px solid ${accent}`,
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ width: 42, height: 42, background: `${accent}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={accent} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function OrganizationsPage() {
  const { setSidebarOpen } = useAdmin();

  const [orgs, setOrgs]           = useState<ApiOrganization[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState<ModalMode>(null);
  const [selected, setSelected]   = useState<ApiOrganization | null>(null);
  const [formError, setFormError] = useState("");

  const emptyForm = { name: "", description: "" };
  const [form, setForm] = useState(emptyForm);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orgService.getAll();
      setOrgs(data);
    } catch {
      toast.error("Gagal memuat data organisasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  // ── Derived ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs.filter(o => {
      const matchSearch = o.name.toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active"   && o.isActive) ||
        (statusFilter === "inactive" && !o.isActive);
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, orgs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const activeCount   = orgs.filter(o => o.isActive).length;
  const inactiveCount = orgs.filter(o => !o.isActive).length;

  // ── Modal helpers ──────────────────────────────────────────
  function openAdd() {
    setForm(emptyForm);
    setFormError("");
    setModal("add");
  }
  function openEdit(o: ApiOrganization) {
    setSelected(o);
    setForm({ name: o.name, description: o.description ?? "" });
    setFormError("");
    setModal("edit");
  }
  function openView(o: ApiOrganization)   { setSelected(o); setModal("view"); }
  function openDelete(o: ApiOrganization) { setSelected(o); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); setFormError(""); }

  // ── CRUD ───────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Nama organisasi wajib diisi."); return; }
    setSaving(true);
    try {
      const payload: CreateOrganizationPayload = {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
      };
      const created = await orgService.create(payload);
      setOrgs(prev => [created, ...prev]);
      toast.success("Organisasi berhasil ditambahkan!");
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? "Gagal menambahkan organisasi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (!form.name.trim()) { setFormError("Nama organisasi wajib diisi."); return; }
    setSaving(true);
    try {
      const payload: UpdateOrganizationPayload = {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
      };
      const updated = await orgService.update(selected.id, payload);
      setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
      toast.success("Organisasi berhasil diperbarui!");
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? "Gagal memperbarui organisasi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(org: ApiOrganization) {
    try {
      const updated = await orgService.update(org.id, { isActive: !org.isActive });
      setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
      toast.success(`Organisasi ${updated.isActive ? "diaktifkan" : "dinonaktifkan"}.`);
    } catch {
      toast.error("Gagal mengubah status organisasi.");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await orgService.remove(selected.id);
      setOrgs(prev => prev.filter(o => o.id !== selected.id));
      toast.success("Organisasi berhasil dihapus.");
      closeModal();
    } catch {
      toast.error("Gagal menghapus. Pastikan tidak ada tagihan atau transaksi yang masih terhubung.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Kelola Organisasi" subtitle="Manajemen data organisasi sekolah" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          <StatCard label="Total Organisasi" value={loading ? "—" : orgs.length}         sub="Semua organisasi"    icon={Building2}   accent="var(--primary)" />
          <StatCard label="Aktif"            value={loading ? "—" : activeCount}          sub="Berjalan aktif"     icon={CheckCircle} accent="var(--success)" />
          <StatCard label="Nonaktif"         value={loading ? "—" : inactiveCount}        sub="Dinonaktifkan"      icon={XCircle}     accent="var(--danger)" />
          <StatCard label="Hasil Filter"     value={loading ? "—" : filtered.length}      sub="Sesuai pencarian"   icon={Search}      accent="#7C3AED" />
        </div>

        {/* Card grid — tampilan unik berbeda dari halaman lain */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", background: "linear-gradient(to right,#fafbfc,#fff)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau deskripsi organisasi..."
                className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} />
            </div>

            {/* Status filter tabs */}
            <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {([["all","Semua"], ["active","Aktif"], ["inactive","Nonaktif"]] as const).map(([v, lbl]) => (
                <button key={v} onClick={() => setStatusFilter(v)} style={{
                  padding: "5px 14px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: statusFilter === v ? "#fff" : "transparent",
                  color: statusFilter === v ? "var(--primary)" : "var(--text-muted)",
                  border: statusFilter === v ? "1px solid var(--border)" : "none",
                }}>{lbl}</button>
              ))}
            </div>

            <button onClick={openAdd} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <Plus size={14} /> Tambah Organisasi
            </button>
          </div>

          {/* Info bar */}
          <div style={{ padding: "7px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> organisasi
            </span>
            {search && <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>Filter: "{search}"</span>}
          </div>

          {/* ── Card Grid (bukan tabel — unique style) ─────── */}
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <Loader2 size={20} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                <span>Memuat data organisasi...</span>
              </div>
            </div>
          ) : paginated.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <Building2 size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .25 }} />
              <p style={{ fontWeight: 600 }}>Tidak ada organisasi ditemukan</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Tambah organisasi baru dengan klik "Tambah Organisasi"</p>
            </div>
          ) : (
            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {paginated.map(o => (
                <div key={o.id} style={{
                  borderRadius: 10, border: "1px solid var(--border)",
                  overflow: "hidden", transition: "box-shadow .15s, transform .15s",
                  background: o.isActive ? "#fff" : "#fafbfc",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
                >
                  {/* Top accent */}
                  <div style={{ height: 4, background: o.isActive ? "linear-gradient(90deg,var(--primary),#7C3AED)" : "#e2e8f0" }} />

                  <div style={{ padding: "16px 16px 14px" }}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <OrgAvatar name={o.name} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</p>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: o.isActive ? "var(--success-light)" : "#f1f5f9",
                          color: o.isActive ? "#065f46" : "var(--text-muted)",
                          borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600,
                        }}>
                          {o.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {o.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, minHeight: 36, marginBottom: 14 }}>
                      {o.description || <span style={{ fontStyle: "italic" }}>Belum ada deskripsi</span>}
                    </p>

                    {/* Footer actions */}
                    <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      <button onClick={() => openView(o)} title="Detail" style={cardBtn}><Eye size={13} /></button>
                      <button onClick={() => openEdit(o)} title="Edit"   style={cardBtn}><Edit2 size={13} /></button>
                      <button
                        onClick={() => handleToggleActive(o)}
                        title={o.isActive ? "Nonaktifkan" : "Aktifkan"}
                        style={{ ...cardBtn, color: o.isActive ? "var(--warning)" : "var(--success)" }}
                      >
                        {o.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => openDelete(o)} title="Hapus" style={{ ...cardBtn, color: "var(--danger)", marginLeft: "auto" }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
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

      {/* ═══ MODAL: ADD ═════════════════════════════════════════ */}
      {modal === "add" && (
        <div style={overlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)", padding: "22px 24px", borderRadius: "12px 12px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>Tambah Organisasi</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Daftarkan organisasi sekolah baru</p>
                </div>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}><X size={18} /></button>
              </div>
            </div>
            <form onSubmit={handleAdd} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label">Nama Organisasi *</label>
                <div style={{ position: "relative" }}>
                  <Building2 size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ paddingLeft: 34 }} placeholder="Contoh: OSIS, Paskibra, KIR" required />
                </div>
                {form.name && <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}><OrgAvatar name={form.name} size={28} /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Preview avatar</span></div>}
              </div>
              <div>
                <label className="form-label">Deskripsi</label>
                <div style={{ position: "relative" }}>
                  <AlignLeft size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: 13, pointerEvents: "none" }} />
                  <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ paddingLeft: 34, resize: "vertical" }} rows={3} placeholder="Deskripsi singkat tentang organisasi ini (opsional)" />
                </div>
              </div>
              <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text-muted)" }}>
                💡 Organisasi baru otomatis berstatus <strong>Aktif</strong>. Status bisa diubah kapan saja via tombol toggle.
              </div>
              {formError && <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>{formError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1.5, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
                  {saving ? "Menyimpan..." : "Tambah Organisasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: EDIT ════════════════════════════════════════ */}
      {modal === "edit" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, #D97706 0%, #92400e 100%)", padding: "22px 24px", borderRadius: "12px 12px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>Edit Organisasi</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Ubah: {selected.name}</p>
                </div>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}><X size={18} /></button>
              </div>
            </div>
            <form onSubmit={handleEdit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label">Nama Organisasi *</label>
                <div style={{ position: "relative" }}>
                  <Building2 size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ paddingLeft: 34 }} required />
                </div>
              </div>
              <div>
                <label className="form-label">Deskripsi</label>
                <div style={{ position: "relative" }}>
                  <AlignLeft size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: 13, pointerEvents: "none" }} />
                  <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ paddingLeft: 34, resize: "vertical" }} rows={3} />
                </div>
              </div>
              <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
                ⚠️ Mengubah nama organisasi bisa berdampak pada tagihan (bills) yang sudah terhubung. Lanjutkan dengan hati-hati.
              </div>
              {formError && <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>{formError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Edit2 size={14} />}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: VIEW ════════════════════════════════════════ */}
      {modal === "view" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 6, background: selected.isActive ? "linear-gradient(90deg,var(--primary),#7C3AED)" : "#e2e8f0", borderRadius: "12px 12px 0 0" }} />
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <OrgAvatar name={selected.name} size={56} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{selected.name}</h3>
                  <div style={{ marginTop: 6 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: selected.isActive ? "var(--success-light)" : "#f1f5f9",
                      color: selected.isActive ? "#065f46" : "var(--text-muted)",
                      borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600,
                    }}>
                      {selected.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {selected.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 4 }}>Deskripsi</p>
                  <p style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.6 }}>{selected.description || "Belum ada deskripsi."}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    ["ID", selected.id.slice(0, 8) + "..."],
                    ["Dibuat", selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("id-ID") : "—"],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{lbl}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={() => openEdit(selected)}>
                  <Edit2 size={13} /> Edit
                </button>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={closeModal}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE ══════════════════════════════════════ */}
      {modal === "delete" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 400, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={26} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Organisasi?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}>
              <strong>{selected.name}</strong> akan dihapus permanen.
            </p>
            <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 24 }}>
              ⚠️ Hapus gagal jika masih ada tagihan, transaksi kas, atau submission yang terhubung ke organisasi ini.
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

// ─── Style constants ─────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modalBox: React.CSSProperties = {
  width: "100%", maxWidth: 480, background: "#fff",
  borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,.18)",
  maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
};
const cardBtn: React.CSSProperties = {
  background: "none", border: "1px solid var(--border)", borderRadius: 7,
  padding: "5px 8px", cursor: "pointer", color: "var(--text-muted)",
  display: "flex", alignItems: "center", transition: "background .12s",
};
const pageBtn: React.CSSProperties = {
  minWidth: 32, height: 32, borderRadius: 6, border: "1px solid var(--border)",
  background: "#fff", color: "var(--text-body)", fontWeight: 600,
  fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};
