"use client";
import { useState, useMemo } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  AlertCircle, CheckCircle, X, Eye, Check, Download,
  Filter, ZoomIn, CreditCard, Clock, TrendingUp,
} from "lucide-react";
import { mockPayments } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import type { Payment, PaymentStatus } from "@/lib/types";

type TabFilter = "all" | PaymentStatus;

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = {
    pending:  { cls: "badge-warning", icon: <Clock size={10} />,        label: "Pending" },
    verified: { cls: "badge-success", icon: <CheckCircle size={10} />,  label: "Terverifikasi" },
    rejected: { cls: "badge-danger",  icon: <X size={10} />,            label: "Ditolak" },
  }[status];
  return <span className={`badge ${cfg.cls}`}>{cfg.icon}{cfg.label}</span>;
}

export default function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab,     setTab]     = useState<TabFilter>("all");
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<"view" | "reject" | null>(null);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const filtered = useMemo(() => {
    return mockPayments.filter(p => {
      const matchTab    = tab === "all" || p.status === tab;
      const matchSearch = p.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          p.tagihan.toLowerCase().includes(search.toLowerCase()) ||
                          p.studentNis.includes(search);
      return matchTab && matchSearch;
    });
  }, [tab, search]);

  const pendingCount  = mockPayments.filter(p => p.status === "pending").length;
  const verifiedCount = mockPayments.filter(p => p.status === "verified").length;
  const rejectedCount = mockPayments.filter(p => p.status === "rejected").length;
  const totalVerifiedAmount = mockPayments.filter(p => p.status === "verified").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <Topbar title="Verifikasi Pembayaran" subtitle="Verifikasi bukti transfer pembayaran siswa" role="admin" userName="Budi Santoso" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {[
            { label: "Menunggu Verifikasi",  value: pendingCount,                         cls: "card-stat-danger",  icon: AlertCircle },
            { label: "Terverifikasi",         value: verifiedCount,                        cls: "card-stat-success", icon: CheckCircle },
            { label: "Ditolak",               value: rejectedCount,                        cls: "card-stat",         icon: X },
            { label: "Total Nominal Masuk",   value: formatCurrency(totalVerifiedAmount),  cls: "card-stat",         icon: CreditCard },
          ].map(({ label, value, cls, icon: Icon }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: typeof value === "string" ? 18 : 28, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ─────────────────────────────────────── */}
        <div className="card">
          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {/* Tab filters */}
            <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {([
                ["all",      "Semua",          mockPayments.length],
                ["pending",  "Pending",         pendingCount],
                ["verified", "Terverifikasi",   verifiedCount],
                ["rejected", "Ditolak",         rejectedCount],
              ] as [TabFilter, string, number][]).map(([v, lbl, count]) => (
                <button key={v} onClick={() => setTab(v)} style={{
                  padding: "5px 14px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: tab === v ? "#fff" : "transparent",
                  color: tab === v ? "var(--primary)" : "var(--text-muted)",
                  border: tab === v ? "1px solid var(--border)" : "none",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {lbl}
                  <span style={{ background: tab === v ? "var(--primary-light)" : "#e2e8f0", color: tab === v ? "var(--primary)" : "var(--text-muted)", borderRadius: 999, padding: "0 6px", fontSize: 11, fontWeight: 700 }}>{count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, NIS, atau tagihan..."
              className="form-input" style={{ fontSize: 13, maxWidth: 260 }}
            />

            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Siswa</th><th>Tagihan</th><th>Organisasi</th><th>Nominal</th><th>Tanggal</th><th>Bukti</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <CreditCard size={32} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                    Tidak ada data pembayaran
                  </td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "var(--primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "var(--primary)", flexShrink: 0 }}>
                          {p.studentName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>{p.studentName}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.kelas} · {p.studentNis}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{p.tagihan}</td>
                    <td><span className="badge badge-primary">{p.organization}</span></td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(p.amount)}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.date}</td>
                    <td>
                      <button
                        onClick={() => { setSelected(p); setModal("view"); }}
                        className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                      >
                        <ZoomIn size={13} /> Lihat
                      </button>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      {p.status === "pending" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={{ background: "var(--success)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }} title="Verifikasi">
                            <Check size={13} /> Verifikasi
                          </button>
                          <button onClick={() => { setSelected(p); setModal("reject"); }}
                            style={{ background: "var(--danger)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }} title="Tolak">
                            <X size={13} /> Tolak
                          </button>
                        </div>
                      ) : p.status === "verified" ? (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Oleh: {p.verifiedBy}</span>
                      ) : (
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => { setSelected(p); setModal("view"); }}>
                          <Eye size={13} /> Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan {filtered.length} dari {mockPayments.length} transaksi</span>
          </div>
        </div>
      </main>

      {/* ── Modal: Lihat Bukti ─────────────────────────────────── */}
      {modal === "view" && selected && (
        <div style={overlayStyle} onClick={() => setModal(null)}>
          <div className="card" style={{ ...modalStyle, maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Detail Pembayaran</h3>
              <button onClick={() => setModal(null)} style={closeBtn}><X size={18} /></button>
            </div>

            {/* Proof image placeholder */}
            <div style={{ background: "var(--bg)", border: "1px dashed var(--border)", borderRadius: 8, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, gap: 8 }}>
              <ZoomIn size={32} color="var(--text-muted)" />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Bukti Transfer</p>
              <span className="badge badge-gray">bukti_transfer_{selected.id}.jpg</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                ["Nama Siswa",   selected.studentName],
                ["NIS",          selected.studentNis],
                ["Kelas",        selected.kelas],
                ["Tagihan",      selected.tagihan],
                ["Organisasi",   selected.organization],
                ["Nominal",      formatCurrency(selected.amount)],
                ["Tanggal",      selected.date],
                ["Status",       selected.status === "pending" ? "Menunggu" : selected.status === "verified" ? "Terverifikasi" : "Ditolak"],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{lbl}</p>
                  <p style={{ fontSize: 14 }}>{val}</p>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>Catatan: {selected.notes}</p>
              </div>
            )}

            {selected.status === "pending" && (
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ flex: 1, background: "var(--success)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Check size={15} /> Verifikasi
                </button>
                <button onClick={() => setModal("reject")} style={{ flex: 1, background: "var(--danger)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <X size={15} /> Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Tolak ──────────────────────────────────────── */}
      {modal === "reject" && selected && (
        <div style={overlayStyle} onClick={() => setModal(null)}>
          <div className="card" style={{ ...modalStyle, maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <X size={26} color="var(--danger)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Tolak Pembayaran?</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Pembayaran <strong>{selected.tagihan}</strong> dari <strong>{selected.studentName}</strong>
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Alasan penolakan *</label>
              <textarea className="form-input" rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai..." style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { setModal(null); setRejectNote(""); }}>Tolak Pembayaran</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalStyle: React.CSSProperties = { width: "100%", maxWidth: 560, padding: 28, position: "relative", maxHeight: "90vh", overflowY: "auto" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" };
