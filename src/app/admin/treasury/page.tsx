"use client";
import { useState, useMemo } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  Plus, TrendingUp, TrendingDown, DollarSign, Trash2,
  Edit2, X, Download, Filter, Building,
} from "lucide-react";
import { mockTransactions, monthlyChartData, mockOrganizations } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type TypeFilter = "all" | TransactionType;

export default function TreasuryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>("all");
  const [orgFilter,   setOrgFilter]   = useState("Semua");
  const [modal,       setModal]       = useState(false);
  const [txType,      setTxType]      = useState<TransactionType>("in");
  const [form, setForm] = useState({ title: "", org: "OSIS", amount: "", date: "", notes: "" });

  const orgsOptions = ["Semua", ...mockOrganizations.map(o => o.shortName)];

  const filtered = useMemo(() => {
    return mockTransactions.filter(t => {
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchOrg  = orgFilter === "Semua" || t.organization === orgFilter;
      return matchType && matchOrg;
    });
  }, [typeFilter, orgFilter]);

  const totalIn  = mockTransactions.filter(t => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const totalOut = mockTransactions.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const balance  = totalIn - totalOut;

  return (
    <>
      <Topbar title="Kas Organisasi" subtitle="Pemasukan & pengeluaran kas seluruh organisasi" role="admin" userName="Budi Santoso" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stat Cards ────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {[
            { label: "Saldo Kas Total",   value: formatCurrency(balance),  cls: balance >= 0 ? "card-stat" : "card-stat-danger", Icon: DollarSign  },
            { label: "Total Masuk",        value: formatCurrency(totalIn),  cls: "card-stat-success",  Icon: TrendingUp  },
            { label: "Total Keluar",       value: formatCurrency(totalOut), cls: "card-stat-danger",   Icon: TrendingDown },
            { label: "Total Transaksi",    value: `${mockTransactions.length}`, cls: "card-stat",      Icon: Building    },
          ].map(({ label, value, cls, Icon }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bar Chart ─────────────────────────────────────── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Grafik Kas Bulanan 2026</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Perbandingan pemasukan & pengeluaran</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Download size={13} /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000000}jt`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={v => formatCurrency(Number(v || 0))} cursor={{ fill: "rgba(2,126,116,.06)" }} />
              <Bar dataKey="pemasukan"   name="Pemasukan"   fill="#027E74" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Organization Balances ──────────────────────────── */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Saldo per Organisasi</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
            {mockOrganizations.map(org => (
              <div key={org.id} style={{ background: "var(--bg)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="badge badge-primary">{org.shortName}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{org.memberCount} anggota</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(org.balance)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction Table ──────────────────────────────── */}
        <div className="card">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {/* Type filter */}
            <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {([["all","Semua"],["in","Pemasukan"],["out","Pengeluaran"]] as [TypeFilter,string][]).map(([v, lbl]) => (
                <button key={v} onClick={() => setTypeFilter(v)} style={{
                  padding: "5px 14px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: typeFilter === v ? "#fff" : "transparent",
                  color: typeFilter === v ? "var(--primary)" : "var(--text-muted)",
                  border: typeFilter === v ? "1px solid var(--border)" : "none",
                }}>{lbl}</button>
              ))}
            </div>

            {/* Org filter */}
            <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
              className="form-input" style={{ fontSize: 13, cursor: "pointer", maxWidth: 150 }}>
              {orgsOptions.map(o => <option key={o}>{o}</option>)}
            </select>

            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={() => { setTxType("out"); setModal(true); }}
                className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <TrendingDown size={13} /> Catat Keluar
              </button>
              <button onClick={() => { setTxType("in"); setModal(true); }}
                className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} /> Catat Masuk
              </button>
            </div>
          </div>

          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Judul</th><th>Organisasi</th><th>Jenis</th><th>Nominal</th><th>Tanggal</th><th>Dicatat Oleh</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{t.title}</td>
                    <td><span className="badge badge-primary">{t.organization}</span></td>
                    <td>
                      {t.type === "in"
                        ? <span className="badge badge-success"><TrendingUp size={10} />Masuk</span>
                        : <span className="badge badge-danger"><TrendingDown size={10} />Keluar</span>}
                    </td>
                    <td style={{ fontWeight: 700, color: t.type === "in" ? "var(--success)" : "var(--danger)" }}>
                      {t.type === "in" ? "+" : "-"}{formatCurrency(t.amount)}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.date}</td>
                    <td style={{ fontSize: 13 }}>{t.recordedBy}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan {filtered.length} dari {mockTransactions.length} transaksi</span>
          </div>
        </div>
      </main>

      {/* ── Modal: Catat Transaksi ─────────────────────────────── */}
      {modal && (
        <div style={overlayStyle} onClick={() => setModal(false)}>
          <div className="card" style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  {txType === "in" ? "Catat Pemasukan Kas" : "Catat Pengeluaran Kas"}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Isi detail transaksi kas organisasi</p>
              </div>
              <button onClick={() => setModal(false)} style={closeBtn}><X size={18} /></button>
            </div>
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={e => { e.preventDefault(); setModal(false); }}>
              <div>
                <label className="form-label">Judul Transaksi *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Contoh: Iuran OSIS Juni 2026" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Organisasi</label>
                  <select className="form-input" value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))}>
                    {mockOrganizations.map(o => <option key={o.id}>{o.shortName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Nominal (Rp) *</label>
                  <input type="number" className="form-input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" required />
                </div>
              </div>
              <div>
                <label className="form-label">Tanggal *</label>
                <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Keterangan (opsional)</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Detail tambahan..." style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModal(false)}>Batal</button>
                <button type="submit" className={`btn ${txType === "in" ? "btn-primary" : "btn-danger"}`} style={{ flex: 1, justifyContent: "center" }}>
                  <Plus size={14} /> {txType === "in" ? "Simpan Pemasukan" : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalStyle: React.CSSProperties = { width: "100%", maxWidth: 480, padding: 28, position: "relative", maxHeight: "90vh", overflowY: "auto" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" };
