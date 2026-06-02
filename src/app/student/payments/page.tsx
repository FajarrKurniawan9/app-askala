"use client";
import { useState, useMemo } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { mockPayments } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, CheckCircle, AlertCircle, Clock, Calendar, CreditCard, Eye, X } from "lucide-react";
import type { PaymentStatus } from "@/lib/types";

// Student s1 payments only
const PAYMENTS = mockPayments.filter(p => p.studentId === "s1");

const statusConf: Record<PaymentStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending:  { label: "Menunggu", cls: "badge-danger",  icon: Clock },
  verified: { label: "Lunas",    cls: "badge-success", icon: CheckCircle },
  rejected: { label: "Ditolak", cls: "badge-danger",  icon: AlertCircle },
};

export default function StudentPaymentsPage() {
  const { setSidebarOpen } = useStudent();
  const [filter, setFilter] = useState<"all" | PaymentStatus>("all");
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const filtered = useMemo(() =>
    PAYMENTS.filter(p => filter === "all" || p.status === filter),
    [filter]
  );

  const totalPending  = PAYMENTS.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalVerified = PAYMENTS.filter(p => p.status === "verified").reduce((s, p) => s + p.amount, 0);

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Pilih file bukti pembayaran terlebih dahulu!"); return; }
    // TODO: await paymentService.uploadProof(selectedId, file)
    toast.success("Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin.");
    setModal(false);
    setFile(null);
  }

  const selected = PAYMENTS.find(p => p.id === selectedId);

  return (
    <>
      <Topbar title="Pembayaran" subtitle="Tagihan iuran & riwayat pembayaran" role="student" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {[
            { label: "Tagihan Pending",  value: formatCurrency(totalPending),  cls: "card-stat-danger",  Icon: AlertCircle },
            { label: "Sudah Dibayar",    value: formatCurrency(totalVerified), cls: "card-stat-success", Icon: CheckCircle },
            { label: "Total Tagihan",    value: `${PAYMENTS.length} tagihan`,  cls: "",                  Icon: CreditCard  },
          ].map(({ label, value, cls, Icon }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                </div>
                <div style={{ width: 38, height: 38, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 4 }}>
            {(["all", "pending", "verified", "rejected"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 16px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                background: filter === f ? "#fff" : "transparent",
                color: filter === f ? "var(--primary)" : "var(--text-muted)",
                border: filter === f ? "1px solid var(--border)" : "none",
              }}>
                {{ all: "Semua", pending: "Pending", verified: "Lunas", rejected: "Ditolak" }[f]}
              </button>
            ))}
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Nama Tagihan</th><th>Org</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <CreditCard size={32} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                    Tidak ada tagihan
                  </td></tr>
                ) : filtered.map(p => {
                  const conf = statusConf[p.status];
                  const Icon = conf.icon;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.tagihan}</td>
                      <td><span className="badge badge-primary">{p.organization}</span></td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(p.amount)}</td>
                      <td><span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}><Calendar size={12} color="var(--text-muted)" />{p.date}</span></td>
                      <td><span className={`badge ${conf.cls}`}><Icon size={11} />{conf.label}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {(p.status === "pending" || p.status === "rejected") && (
                            <button
                              className={`btn ${p.status === "rejected" ? "btn-danger" : "btn-primary"} btn-sm`}
                              style={{ display: "flex", alignItems: "center", gap: 5 }}
                              onClick={() => { setSelectedId(p.id); setModal(true); }}
                            >
                              <Upload size={12} /> {p.status === "rejected" ? "Upload Ulang" : "Upload Bukti"}
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Eye size={12} /> Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan {filtered.length} dari {PAYMENTS.length} tagihan</span>
          </div>
        </div>

        {/* Info banner */}
        <div style={{ background: "var(--primary-light)", border: "1px solid rgba(2,126,116,.2)", borderRadius: 10, padding: "16px 20px", display: "flex", gap: 14 }}>
          <AlertCircle size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>Cara Upload Bukti Pembayaran</p>
            <p style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.6 }}>
              1. Klik tombol &quot;Upload Bukti&quot; pada tagihan Pending.<br />
              2. Upload foto/screenshot bukti transfer (JPG, PNG, PDF — maks. 5MB).<br />
              3. Tunggu verifikasi Admin (maks. 1×24 jam).
            </p>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {modal && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="card" style={{ width: "100%", maxWidth: 460, padding: 32, position: "relative" }}>
            <button onClick={() => { setModal(false); setFile(null); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Upload Bukti Pembayaran</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>{selected.tagihan} — {formatCurrency(selected.amount)}</p>
            <form onSubmit={handleUpload}>
              <label style={{ display: "block", border: "2px dashed var(--border)", borderRadius: 10, padding: 36, textAlign: "center", cursor: "pointer", marginBottom: 20, transition: "border-color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                <div style={{ width: 48, height: 48, background: "var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Upload size={22} color="var(--primary)" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {file ? file.name : "Klik untuk pilih file"}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>JPG, PNG, PDF — Maks. 5MB</p>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setModal(false); setFile(null); }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}><Upload size={14} /> Kirim Bukti</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
