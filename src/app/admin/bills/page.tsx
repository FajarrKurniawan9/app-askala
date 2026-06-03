"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import {
  CreditCard, Plus, Search, Eye, Edit2, Trash2, X,
  Loader2, Calendar, Building2, DollarSign,
  ChevronLeft, ChevronRight, Tag, AlertCircle,
} from "lucide-react";
import { billService } from "@/services/bill.service";
import type { CreateBillPayload, UpdateBillPayload } from "@/services/bill.service";
import { orgService } from "@/services/portfolio.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { ApiBill, ApiOrganization } from "@/lib/types";

type ModalMode = "add" | "edit" | "view" | "delete" | null;
const PAGE_SIZE = 10;

// ─── Bill Icon — generates a unique color per bill title ────
function BillIcon({ title, size = 38 }: { title: string; size?: number }) {
  const palette = ["#027E74","#0891B2","#7C3AED","#D97706","#DC2626","#059669","#DB2777"];
  const color = palette[title.charCodeAt(0) % palette.length];
  const initials = title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: `${color}18`, border: `1.5px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color, fontWeight: 800, fontSize: size * 0.3, flexShrink: 0,
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
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
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
export default function BillsPage() {
  const { setSidebarOpen } = useAdmin();

  const [bills, setBills]       = useState<ApiBill[]>([]);
  const [orgs, setOrgs]         = useState<ApiOrganization[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [orgFilter, setOrgFilter] = useState("Semua");
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState<ModalMode>(null);
  const [selected, setSelected] = useState<ApiBill | null>(null);
  const [formError, setFormError] = useState("");

  const emptyForm = { title: "", amount: "", dueDate: "", orgId: "" };
  const [form, setForm] = useState(emptyForm);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [b, o] = await Promise.all([billService.getAll(), orgService.getAll()]);
      setBills(b);
      setOrgs(o);
    } catch {
      toast.error("Gagal memuat data tagihan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────
  const orgOptions = useMemo(() => ["Semua", ...orgs.map(o => o.name)], [orgs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bills.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(q) || (b.org?.name ?? "").toLowerCase().includes(q);
      const matchOrg    = orgFilter === "Semua" || (b.org?.name ?? b.organization?.name) === orgFilter;
      return matchSearch && matchOrg;
    });
  }, [search, orgFilter, bills]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, orgFilter]);

  // stats
  const totalAmount  = bills.reduce((s, b) => s + b.amount, 0);
  const withOrg      = bills.filter(b => b.orgId).length;
  const dueSoon      = bills.filter(b => {
    if (!b.dueDate) return false;
    const days = (new Date(b.dueDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 7;
  }).length;

  // ── Modal helpers ──────────────────────────────────────────
  function openAdd() {
    setForm(emptyForm);
    setFormError("");
    setModal("add");
  }
  function openEdit(b: ApiBill) {
    setSelected(b);
    setForm({
      title:   b.title,
      amount:  String(b.amount),
      dueDate: b.dueDate ? b.dueDate.split("T")[0] : "",
      orgId:   b.orgId ?? "",
    });
    setFormError("");
    setModal("edit");
  }
  function openView(b: ApiBill)   { setSelected(b); setModal("view"); }
  function openDelete(b: ApiBill) { setSelected(b); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); setFormError(""); }

  // ── Validation helper ──────────────────────────────────────
  function validateForm(): string | null {
    if (!form.title.trim()) return "Nama tagihan wajib diisi.";
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) return "Nominal harus berupa angka positif.";
    return null;
  }

  // ── CRUD ───────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSaving(true);
    try {
      const payload: CreateBillPayload = {
        title:   form.title.trim(),
        amount:  Number(form.amount),
        dueDate: form.dueDate || undefined,
        orgId:   form.orgId  || undefined,
      };
      const created = await billService.create(payload);
      setBills(prev => [created, ...prev]);
      toast.success("Tagihan berhasil dibuat!");
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? "Gagal membuat tagihan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSaving(true);
    try {
      const payload: UpdateBillPayload = {
        title:   form.title.trim(),
        amount:  Number(form.amount),
        dueDate: form.dueDate || undefined,
        orgId:   form.orgId  || undefined,
      };
      const updated = await billService.update(selected.id, payload);
      setBills(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success("Tagihan berhasil diperbarui!");
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? "Gagal memperbarui tagihan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await billService.remove(selected.id);
      setBills(prev => prev.filter(b => b.id !== selected.id));
      toast.success("Tagihan berhasil dihapus.");
      closeModal();
    } catch {
      toast.error("Gagal menghapus tagihan. Pastikan tidak ada submission yang masih terhubung.");
    } finally {
      setSaving(false);
    }
  }

  // ── Due date helper ────────────────────────────────────────
  function dueBadge(dueDate?: string) {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (days < 0)   return <span style={{ ...chip, background: "#fee2e2", color: "#dc2626" }}>Lewat jatuh tempo</span>;
    if (days <= 3)  return <span style={{ ...chip, background: "#fef3c7", color: "#92400e" }}>≤3 hari lagi</span>;
    if (days <= 7)  return <span style={{ ...chip, background: "#fef3c7", color: "#92400e" }}>{days} hari lagi</span>;
    return <span style={{ ...chip, background: "#f1f5f9", color: "#475569" }}>{days} hari lagi</span>;
  }

  return (
    <>
      <Topbar title="Kelola Tagihan" subtitle="Manajemen tagihan iuran seluruh organisasi" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          <StatCard label="Total Tagihan"   value={loading ? "—" : bills.length}          sub="Semua tagihan"        icon={CreditCard}  accent="var(--primary)" />
          <StatCard label="Total Nominal"   value={loading ? "—" : formatCurrency(totalAmount)} sub="Akumulasi semua tagihan" icon={DollarSign}  accent="var(--success)" />
          <StatCard label="Terhubung Org"   value={loading ? "—" : withOrg}               sub="Dengan organisasi"    icon={Building2}   accent="#7C3AED" />
          <StatCard label="Jatuh Tempo"     value={loading ? "—" : dueSoon}               sub="Dalam 7 hari ke depan" icon={AlertCircle} accent="var(--warning)" />
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", background: "linear-gradient(to right,#fafbfc,#fff)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama tagihan atau organisasi..."
                className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} />
            </div>
            <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
              className="form-input" style={{ fontSize: 13, cursor: "pointer", minWidth: 150 }}>
              {orgOptions.map(o => <option key={o}>{o}</option>)}
            </select>
            <button onClick={openAdd} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <Plus size={14} /> Buat Tagihan
            </button>
          </div>

          {/* Info row */}
          <div style={{ padding: "7px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> tagihan
            </span>
            {search && <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>Filter: "{search}"</span>}
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Tagihan", "Nominal", "Organisasi", "Jatuh Tempo", "Sisa Hari", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <Loader2 size={20} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                      <span>Memuat data tagihan...</span>
                    </div>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <CreditCard size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .25 }} />
                    <p style={{ fontWeight: 600 }}>Tidak ada tagihan ditemukan</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Buat tagihan baru dengan klik "Buat Tagihan"</p>
                  </td></tr>
                ) : paginated.map((b, idx) => {
                  const isEven = idx % 2 === 0;
                  const orgName = b.org?.name ?? b.organization?.name;
                  return (
                    <tr key={b.id} style={{ background: isEven ? "#fff" : "#fafbfc", borderBottom: "1px solid var(--border)", transition: "background .12s" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-light)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isEven ? "#fff" : "#fafbfc")}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <BillIcon title={b.title} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{b.title}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                              Dibuat {b.createdAt ? formatDate(b.createdAt) : "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--success)" }}>{formatCurrency(b.amount)}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {orgName
                          ? <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{orgName}</span>
                          : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                        }
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                        {b.dueDate
                          ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={12} />{b.dueDate.split("T")[0]}</span>
                          : "—"
                        }
                      </td>
                      <td style={{ padding: "12px 16px" }}>{dueBadge(b.dueDate)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => openView(b)}   title="Detail" style={actionBtn}><Eye size={13} /></button>
                          <button onClick={() => openEdit(b)}   title="Edit"   style={actionBtn}><Edit2 size={13} /></button>
                          <button onClick={() => openDelete(b)} title="Hapus"  style={{ ...actionBtn, color: "var(--danger)" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
        </div>
      </main>

      {/* ═══ MODAL: ADD / EDIT ══════════════════════════════════ */}
      {(modal === "add" || modal === "edit") && (
        <div style={overlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{
              background: modal === "add"
                ? "linear-gradient(135deg, var(--primary) 0%, #02635c 100%)"
                : "linear-gradient(135deg, #D97706 0%, #92400e 100%)",
              padding: "22px 24px", borderRadius: "12px 12px 0 0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
                    {modal === "add" ? "Buat Tagihan Baru" : "Edit Tagihan"}
                  </h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>
                    {modal === "add" ? "Isi detail tagihan iuran" : `Ubah: ${selected?.title}`}
                  </p>
                </div>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}><X size={18} /></button>
              </div>
            </div>

            <form onSubmit={modal === "add" ? handleAdd : handleEdit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Title */}
              <div>
                <label className="form-label">Nama Tagihan *</label>
                <div style={{ position: "relative" }}>
                  <Tag size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    style={{ paddingLeft: 34 }} placeholder="Contoh: Iuran OSIS Juni 2026" required />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="form-label">Nominal (IDR) *</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, pointerEvents: "none" }}>Rp</span>
                  <input type="number" className="form-input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    style={{ paddingLeft: 34 }} placeholder="50000" min={1} required />
                </div>
                {form.amount && Number(form.amount) > 0 && (
                  <p style={{ fontSize: 12, color: "var(--success)", marginTop: 4, fontWeight: 600 }}>= {formatCurrency(Number(form.amount))}</p>
                )}
              </div>

              {/* Due date + Org */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Jatuh Tempo</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={{ paddingLeft: 34 }} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Organisasi</label>
                  <div style={{ position: "relative" }}>
                    <Building2 size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <select className="form-input" value={form.orgId} onChange={e => setForm(f => ({ ...f, orgId: e.target.value }))} style={{ paddingLeft: 34 }}>
                      <option value="">— Tanpa Organisasi —</option>
                      {orgs.filter(o => o.isActive).map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text-muted)" }}>
                💡 Jika tagihan terhubung ke organisasi, setiap pembayaran yang diverifikasi akan otomatis mencatat pemasukan kas organisasi tersebut.
              </div>

              {formError && (
                <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>{formError}</div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1.5, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
                  {saving ? "Menyimpan..." : modal === "add" ? "Buat Tagihan" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: VIEW ════════════════════════════════════════ */}
      {modal === "view" && selected && (
        <div style={overlay} onClick={closeModal}>
          <div style={{ ...modalBox, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            {/* Colored header strip */}
            <div style={{ height: 6, background: "linear-gradient(90deg, var(--primary), #7C3AED, var(--warning))", borderRadius: "12px 12px 0 0" }} />
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <BillIcon title={selected.title} size={52} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{selected.title}</h3>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "var(--success)", marginTop: 4 }}>{formatCurrency(selected.amount)}</p>
                </div>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: Building2,  label: "Organisasi",    value: selected.org?.name ?? selected.organization?.name ?? "Tidak terhubung" },
                  { icon: Calendar,   label: "Jatuh Tempo",   value: selected.dueDate ? selected.dueDate.split("T")[0] : "Tidak ditentukan" },
                  { icon: Tag,        label: "ID Tagihan",    value: selected.id.slice(0, 8) + "..." },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                    <Icon size={15} color="var(--primary)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)" }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 1 }}>{value}</p>
                    </div>
                  </div>
                ))}
                {selected.dueDate && <div style={{ marginTop: 4 }}>{dueBadge(selected.dueDate)}</div>}
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
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Tagihan?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}>
              <strong>{selected.title}</strong> ({formatCurrency(selected.amount)}) akan dihapus permanen.
            </p>
            <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 24 }}>
              ⚠️ Hapus gagal jika masih ada submission siswa yang terhubung ke tagihan ini.
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
  width: "100%", maxWidth: 520, background: "#fff",
  borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,.18)",
  maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
};
const actionBtn: React.CSSProperties = {
  background: "none", border: "1px solid var(--border)", borderRadius: 6,
  padding: "5px 8px", cursor: "pointer", color: "var(--text-muted)",
  display: "flex", alignItems: "center", transition: "background .12s",
};
const pageBtn: React.CSSProperties = {
  minWidth: 32, height: 32, borderRadius: 6, border: "1px solid var(--border)",
  background: "#fff", color: "var(--text-body)", fontWeight: 600,
  fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};
const chip: React.CSSProperties = {
  display: "inline-block", borderRadius: 999, padding: "2px 10px",
  fontSize: 11, fontWeight: 600,
};
