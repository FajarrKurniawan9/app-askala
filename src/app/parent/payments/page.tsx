"use client";
import { useState, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import {
  CheckCircle, AlertCircle, Clock, Calendar, CreditCard, Eye, X, ZoomIn,
} from "lucide-react";
import { mockPayments } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

// Filter only student s1 payments for parent view
const STUDENT_PAYMENTS = mockPayments.filter(p => p.studentId === "s1");

const STATUS_CFG: Record<PaymentStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:  { label: "Menunggu",       cls: "badge-danger",  icon: <Clock size={10} /> },
  verified: { label: "Lunas",          cls: "badge-success", icon: <CheckCircle size={10} /> },
  rejected: { label: "Ditolak",        cls: "badge-danger",  icon: <AlertCircle size={10} /> },
};

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};

export default function ParentPaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | PaymentStatus>("all");
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<(typeof STUDENT_PAYMENTS)[0] | null>(null);

  const filtered = useMemo(() =>
    STUDENT_PAYMENTS.filter(p => filter === "all" || p.status === filter),
    [filter]
  );

  const totalPending  = STUDENT_PAYMENTS.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalVerified = STUDENT_PAYMENTS.filter(p => p.status === "verified").reduce((s, p) => s + p.amount, 0);
  const pendingCount  = STUDENT_PAYMENTS.filter(p => p.status === "pending").length;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="parent" userName="Ibu Kartini" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar title="Status Pembayaran" subtitle="Riwayat iuran dan tagihan Ahmad Rizky" role="parent" setSidebarOpen={setSidebarOpen} />

        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {[
              { label: "Belum Dibayar", value: formatCurrency(totalPending), cls: "card-stat-danger",  Icon: AlertCircle },
              { label: "Sudah Dibayar", value: formatCurrency(totalVerified), cls: "card-stat-success", Icon: CheckCircle },
              { label: "Total Tagihan", value: `${STUDENT_PAYMENTS.length} tagihan`, cls: "card-stat",  Icon: CreditCard },
            ].map(({ label, value, cls, Icon }) => (
              <div key={label} className={`card-stat ${cls}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 8 }}>{label}</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                  </div>
                  <div style={{ width: 38, height: 38, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color="var(--primary)" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert if pending */}
          {pendingCount > 0 && (
            <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 2 }}>
                  {pendingCount} Tagihan Belum Dibayar
                </p>
                <p style={{ fontSize: 13, color: "var(--text-body)" }}>
                  Ahmad Rizky memiliki {pendingCount} tagihan yang belum diselesaikan. Total kewajiban: <strong>{formatCurrency(totalPending)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card">
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 4 }}>
              {([["all", "Semua"], ["pending", "Menunggu"], ["verified", "Lunas"], ["rejected", "Ditolak"]] as ["all" | PaymentStatus, string][]).map(([v, lbl]) => (
                <button key={v} onClick={() => setFilter(v)} style={{
                  padding: "6px 14px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  background: filter === v ? "#fff" : "transparent",
                  color: filter === v ? "var(--primary)" : "var(--text-muted)",
                  border: filter === v ? "1px solid var(--border)" : "none",
                }}>{lbl}</button>
              ))}
            </div>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>Nama Tagihan</th><th>Organisasi</th><th>Nominal</th><th>Tanggal</th><th>Status</th><th>Detail</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                      <CreditCard size={32} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                      Tidak ada data pembayaran
                    </td></tr>
                  ) : filtered.map(p => {
                    const cfg = STATUS_CFG[p.status];
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.tagihan}</td>
                        <td><span className="badge badge-primary">{p.organization}</span></td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(p.amount)}</td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={11} />{p.date}
                        </td>
                        <td><span className={`badge ${cfg.cls}`}>{cfg.icon}{cfg.label}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}
                            onClick={() => { setSelected(p); setModal(true); }}>
                            <Eye size={12} /> Lihat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan {filtered.length} dari {STUDENT_PAYMENTS.length} tagihan</span>
            </div>
          </div>

        </main>
      </div>

      {/* Detail Modal */}
      {modal && selected && (
        <div style={overlay} onClick={() => setModal(false)}>
          <div className="card" style={{ width: "100%", maxWidth: 460, padding: 28, position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Detail Pembayaran</h3>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <div style={{ background: "var(--bg)", border: "1px dashed var(--border)", borderRadius: 8, height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, gap: 6 }}>
              <ZoomIn size={28} color="var(--text-muted)" />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Bukti Transfer</p>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>bukti_{selected.id}.jpg</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              {[
                ["Tagihan", selected.tagihan],
                ["Organisasi", selected.organization],
                ["Nominal", formatCurrency(selected.amount)],
                ["Tanggal", selected.date],
                ["Status", STATUS_CFG[selected.status].label],
                ...(selected.notes ? [["Catatan", selected.notes]] : []),
              ].map(([l, v]) => (
                <div key={l}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{l}</p>
                  <p style={{ fontSize: 14 }}>{v}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => setModal(false)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
