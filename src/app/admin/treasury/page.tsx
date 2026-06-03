"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import { useAuthStore } from "@/store/authStore";
import {
  Plus, TrendingUp, TrendingDown, DollarSign, Trash2,
  Edit2, X, Loader2, Building2, ChevronLeft, ChevronRight,
  Calendar, FileText, Search,
} from "lucide-react";
import { treasuryService, type ApiTreasury, type TreasuryType } from "@/services/treasury.service";
import { orgService } from "@/services/portfolio.service";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { ApiOrganization } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type TypeFilter = "all" | TreasuryType;
type ModalMode  = "add" | "edit" | "delete" | null;
const PAGE_SIZE = 12;

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string; icon: React.ElementType; accent: string; sub?: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)", borderTop: `3px solid ${accent}`, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ width: 42, height: 42, background: `${accent}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={accent} />
        </div>
      </div>
    </div>
  );
}

export default function TreasuryPage() {
  const { setSidebarOpen } = useAdmin();
  const { user } = useAuthStore();

  const [transactions, setTransactions] = useState<ApiTreasury[]>([]);
  const [orgs, setOrgs]       = useState<ApiOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [orgFilter, setOrgFilter]   = useState("Semua");
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState<ModalMode>(null);
  const [txType, setTxType]   = useState<TreasuryType>("IN");
  const [selected, setSelected] = useState<ApiTreasury | null>(null);
  const [formError, setFormError] = useState("");

  const emptyForm = { title: "", orgId: "", amount: "", date: new Date().toISOString().split("T")[0], description: "" };
  const [form, setForm] = useState(emptyForm);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, org] = await Promise.all([treasuryService.getAll(), orgService.getAll()]);
      setTransactions(tx);
      setOrgs(org);
    } catch {
      toast.error("Gagal memuat data kas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────
  const orgOptions = useMemo(() => ["Semua", ...orgs.map(o => o.name)], [orgs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(q) || (t.org?.name ?? "").toLowerCase().includes(q);
      const matchType   = typeFilter === "all" || t.type === typeFilter;
      const matchOrg    = orgFilter === "Semua" || t.org?.name === orgFilter;
      return matchSearch && matchType && matchOrg;
    });
  }, [search, typeFilter, orgFilter, transactions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, typeFilter, orgFilter]);

  const totalIn  = transactions.filter(t => t.type === "IN").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
  const balance  = totalIn - totalOut;

  // ── Chart data — aggregate per bulan dari data live ────────
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const chartData = MONTHS.map((bulan, idx) => {
    const txBulanIni = transactions.filter(t => new Date(t.date).getMonth() === idx);
    return {
      bulan,
      pemasukan:   txBulanIni.filter(t => t.type === "IN").reduce((s, t) => s + t.amount, 0),
      pengeluaran: txBulanIni.filter(t => t.type === "OUT").reduce((s, t) => s + t.amount, 0),
    };
  });

  // ── Saldo per org dari data live ───────────────────────────
  const orgBalances = useMemo(() => {
    return orgs.map(o => {
      const orgTx = transactions.filter(t => t.orgId === o.id);
      const masuk  = orgTx.filter(t => t.type === "IN").reduce((s, t) => s + t.amount, 0);
      const keluar = orgTx.filter(t => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
      return { ...o, saldo: masuk - keluar, txCount: orgTx.length };
    });
  }, [orgs, transactions]);

  // ── Modal helpers ──────────────────────────────────────────
  function openAdd(type: TreasuryType) {
    setTxType(type);
    setForm(emptyForm);
    setFormError("");
    setModal("add");
  }
  function openEdit(t: ApiTreasury) {
    setSelected(t);
    setTxType(t.type);
    setForm({ title: t.title, orgId: t.orgId, amount: String(t.amount), date: t.date.split("T")[0], description: t.description ?? "" });
    setFormError("");
    setModal("edit");
  }
  function openDelete(t: ApiTreasury) { setSelected(t); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); setFormError(""); }

  // ── CRUD ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Judul wajib diisi."); return; }
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) { setFormError("Nominal harus angka positif."); return; }
    if (!form.orgId) { setFormError("Pilih organisasi terlebih dahulu."); return; }
    if (!user?.id) { setFormError("Sesi tidak valid. Silakan login ulang."); return; }
    setSaving(true);
    try {
      if (modal === "add") {
        const created = await treasuryService.create({
          type: txType, title: form.title.trim(), amount: amt,
          date: new Date(form.date).toISOString(),
          orgId: form.orgId, createdById: user.id,
          description: form.description.trim() || undefined,
        });
        setTransactions(prev => [created, ...prev]);
        toast.success(`${txType === "IN" ? "Pemasukan" : "Pengeluaran"} berhasil dicatat!`);
      } else if (modal === "edit" && selected) {
        const updated = await treasuryService.update(selected.id, {
          type: txType, title: form.title.trim(), amount: amt,
          date: new Date(form.date).toISOString(),
          orgId: form.orgId, createdById: user.id,
          description: form.description.trim() || undefined,
        });
        setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success("Transaksi berhasil diperbarui!");
      }
      closeModal();
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(", ") : (raw ?? "Gagal menyimpan transaksi. Periksa kembali data yang diisi.");
      setFormError(msg);
      console.error("[Treasury] create/update error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await treasuryService.remove(selected.id);
      setTransactions(prev => prev.filter(t => t.id !== selected.id));
      toast.success("Transaksi berhasil dihapus.");
      closeModal();
    } catch {
      toast.error("Gagal menghapus transaksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Kas Organisasi" subtitle="Pemasukan & pengeluaran kas seluruh organisasi" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          <StatCard label="Saldo Kas Total" value={loading ? "—" : formatCurrency(balance)}  accent={balance >= 0 ? "var(--primary)" : "var(--danger)"} icon={DollarSign} sub={balance >= 0 ? "Surplus" : "Defisit"} />
          <StatCard label="Total Masuk"     value={loading ? "—" : formatCurrency(totalIn)}   accent="var(--success)" icon={TrendingUp} />
          <StatCard label="Total Keluar"    value={loading ? "—" : formatCurrency(totalOut)}  accent="var(--danger)"  icon={TrendingDown} />
          <StatCard label="Total Transaksi" value={loading ? "—" : String(transactions.length)} accent="#7C3AED" icon={Building2} />
        </div>

        {/* Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Grafik Kas Bulanan</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Data live dari backend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? "0" : `${(v/1000000).toFixed(1)}jt`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={v => formatCurrency(Number(v || 0))} cursor={{ fill: "rgba(2,126,116,.06)" }} />
              <Bar dataKey="pemasukan"   name="Pemasukan"   fill="#027E74" radius={[4,4,0,0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#DC2626" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {[{ color: "#027E74", label: "Pemasukan" }, { color: "#DC2626", label: "Pengeluaran" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Saldo per org — dari data live */}
        {!loading && orgBalances.length > 0 && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Saldo per Organisasi</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
              {orgBalances.map(org => (
                <div key={org.id} style={{ background: "var(--bg)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{org.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{org.txCount} tx</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: org.saldo >= 0 ? "var(--success)" : "var(--danger)" }}>{formatCurrency(org.saldo)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", background: "linear-gradient(to right,#fafbfc,#fff)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} placeholder="Cari judul atau organisasi..." />
            </div>
            <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {([["all","Semua"],["IN","Pemasukan"],["OUT","Pengeluaran"]] as [TypeFilter, string][]).map(([v, lbl]) => (
                <button key={v} onClick={() => setTypeFilter(v)} style={{
                  padding: "5px 12px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: typeFilter === v ? "#fff" : "transparent",
                  color: typeFilter === v ? "var(--primary)" : "var(--text-muted)",
                  border: typeFilter === v ? "1px solid var(--border)" : "none",
                }}>{lbl}</button>
              ))}
            </div>
            <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)} className="form-input" style={{ fontSize: 13, cursor: "pointer", maxWidth: 160 }}>
              {orgOptions.map(o => <option key={o}>{o}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={() => openAdd("OUT")} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <TrendingDown size={13} /> Catat Keluar
              </button>
              <button onClick={() => openAdd("IN")} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} /> Catat Masuk
              </button>
            </div>
          </div>

          <div style={{ padding: "7px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> transaksi</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Judul","Organisasi","Jenis","Nominal","Tanggal","Keterangan","Aksi"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)" }}>
                      <Loader2 size={20} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} /><span>Memuat data kas...</span>
                    </div>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    <DollarSign size={36} style={{ display: "block", margin: "0 auto 10px", opacity: .25 }} />
                    <p style={{ fontWeight: 600 }}>Tidak ada transaksi ditemukan</p>
                  </td></tr>
                ) : paginated.map((t, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr key={t.id} style={{ background: isEven ? "#fff" : "#fafbfc", borderBottom: "1px solid var(--border)", transition: "background .12s" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-light)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isEven ? "#fff" : "#fafbfc")}>
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>{t.title}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{t.org?.name ?? "—"}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {t.type === "IN"
                          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--success-light)", color: "#065f46", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}><TrendingUp size={10} />Masuk</span>
                          : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--danger-light)", color: "var(--danger)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}><TrendingDown size={10} />Keluar</span>}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: t.type === "IN" ? "var(--success)" : "var(--danger)" }}>
                        {t.type === "IN" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{t.date.split("T")[0]}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.description || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => openEdit(t)} style={actionBtn}><Edit2 size={13} /></button>
                          <button onClick={() => openDelete(t)} style={{ ...actionBtn, color: "var(--danger)" }}><Trash2 size={13} /></button>
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
            <div style={{
              background: txType === "IN" ? "linear-gradient(135deg,var(--primary),#02635c)" : "linear-gradient(135deg,var(--danger),#b91c1c)",
              padding: "22px 24px", borderRadius: "12px 12px 0 0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
                    {modal === "add" ? (txType === "IN" ? "Catat Pemasukan" : "Catat Pengeluaran") : "Edit Transaksi"}
                  </h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Isi detail transaksi kas organisasi</p>
                </div>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}><X size={18} /></button>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Judul Transaksi *</label>
                <div style={{ position: "relative" }}>
                  <FileText size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ paddingLeft: 34 }} placeholder="Contoh: Iuran OSIS Juni 2026" required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Organisasi *</label>
                  <div style={{ position: "relative" }}>
                    <Building2 size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <select className="form-input" value={form.orgId} onChange={e => setForm(f => ({ ...f, orgId: e.target.value }))} style={{ paddingLeft: 34 }} required>
                      <option value="">— Pilih Org —</option>
                      {orgs.filter(o => o.isActive).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Nominal (Rp) *</label>
                  <input type="number" className="form-input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="50000" min={1} required />
                  {form.amount && Number(form.amount) > 0 && <p style={{ fontSize: 11, color: "var(--success)", marginTop: 3 }}>= {formatCurrency(Number(form.amount))}</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Tanggal *</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={13} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ paddingLeft: 34 }} required />
                </div>
              </div>
              <div>
                <label className="form-label">Keterangan (opsional)</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} placeholder="Detail tambahan..." />
              </div>
              {formError && <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>{formError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeModal}>Batal</button>
                <button type="submit" disabled={saving} className={`btn ${txType === "IN" ? "btn-primary" : "btn-danger"}`} style={{ flex: 1.5, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : txType === "IN" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {saving ? "Menyimpan..." : modal === "add" ? (txType === "IN" ? "Simpan Pemasukan" : "Simpan Pengeluaran") : "Simpan Perubahan"}
                </button>
              </div>
            </form>
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
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Transaksi?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              <strong>{selected.title}</strong> ({selected.type === "IN" ? "+" : "-"}{formatCurrency(selected.amount)}) akan dihapus permanen.
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
