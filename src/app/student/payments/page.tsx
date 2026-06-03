"use client";
import { useState, useMemo, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { billService } from "@/services/bill.service";
import { submissionService } from "@/services/submission.service";
import { uploadService } from "@/services/upload.service";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, CheckCircle, AlertCircle, Clock, Calendar, CreditCard, Eye, X, Loader2 } from "lucide-react";
import type { ApiBill, ApiSubmission, SubmissionStatus } from "@/lib/types";

const statusConf: Record<SubmissionStatus, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING:   { label: "Menunggu", cls: "badge-danger",  icon: Clock },
  VERIFIED:  { label: "Lunas",    cls: "badge-success", icon: CheckCircle },
  REJECTED:  { label: "Ditolak",  cls: "badge-danger",  icon: AlertCircle },
};

export default function StudentPaymentsPage() {
  const { setSidebarOpen } = useStudent();
  const { user, studentProfileId } = useAuthStore();

  const [bills, setBills] = useState<ApiBill[]>([]);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");
  const [modal, setModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<ApiBill | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([billService.getAll(), submissionService.getAll()])
      .then(([b, s]) => { setBills(b); setSubmissions(s); })
      .catch(() => toast.error("Gagal memuat data pembayaran."))
      .finally(() => setLoading(false));
  }, []);

  // Map bill to submission status for current student
  function getSubmission(billId: string): ApiSubmission | undefined {
    return submissions.find(s => s.billId === billId);
  }

  const billsWithStatus = useMemo(() => bills.map(b => ({
    bill: b,
    submission: getSubmission(b.id),
  })), [bills, submissions]);

  const filtered = useMemo(() => {
    if (filter === "all") return billsWithStatus;
    return billsWithStatus.filter(({ submission }) =>
      submission?.status === filter || (!submission && filter === "PENDING")
    );
  }, [billsWithStatus, filter]);

  const totalPending  = submissions.filter(s => s.status === "PENDING").reduce((sum, s) => sum + (s.bill?.amount ?? 0), 0);
  const totalVerified = submissions.filter(s => s.status === "VERIFIED").reduce((sum, s) => sum + (s.bill?.amount ?? 0), 0);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedBill) { toast.error("Pilih file terlebih dahulu!"); return; }
    setUploading(true);
    try {
      const { fileUrl } = await uploadService.uploadFile(file);
      const existing = getSubmission(selectedBill.id);
      if (existing) {
        // Re-upload: update existing submission
        const updated = await submissionService.update(existing.id, { fileUrl, status: "PENDING" });
        setSubmissions(prev => prev.map(s => s.id === existing.id ? updated : s));
      } else {
        // First submission
        const created = await submissionService.create({
          billId: selectedBill.id,
          studentId: studentProfileId ?? "",
          fileUrl,
        });
        setSubmissions(prev => [...prev, created]);
      }
      toast.success("Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin.");
      setModal(false);
      setFile(null);
    } catch {
      toast.error("Gagal mengirim bukti pembayaran.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return (
    <>
      <Topbar title="Pembayaran" subtitle="Tagihan iuran & riwayat pembayaran" role="student" setSidebarOpen={setSidebarOpen} />
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <Loader2 size={24} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "var(--text-muted)" }}>Memuat data pembayaran...</span>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );

  return (
    <>
      <Topbar title="Pembayaran" subtitle="Tagihan iuran & riwayat pembayaran" role="student" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {[
            { label: "Tagihan Pending",  value: formatCurrency(totalPending),  cls: "card-stat-danger",  Icon: AlertCircle },
            { label: "Sudah Dibayar",    value: formatCurrency(totalVerified), cls: "card-stat-success", Icon: CheckCircle },
            { label: "Total Tagihan",    value: `${bills.length} tagihan`,     cls: "",                  Icon: CreditCard  },
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
            {(["all", "PENDING", "VERIFIED", "REJECTED"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 16px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer",
                background: filter === f ? "#fff" : "transparent",
                color: filter === f ? "var(--primary)" : "var(--text-muted)",
                border: filter === f ? "1px solid var(--border)" : "none",
              }}>
                {{ all: "Semua", PENDING: "Pending", VERIFIED: "Lunas", REJECTED: "Ditolak" }[f]}
              </button>
            ))}
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Nama Tagihan</th><th>Organisasi</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <CreditCard size={32} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                    Tidak ada tagihan
                  </td></tr>
                ) : filtered.map(({ bill, submission }) => {
                  const status: SubmissionStatus = submission?.status ?? "PENDING";
                  const conf = statusConf[status];
                  const Icon = conf.icon;
                  const isPending = !submission || status === "PENDING";
                  const isRejected = status === "REJECTED";
                  return (
                    <tr key={bill.id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{bill.title}</td>
                      <td><span className="badge badge-primary">{bill.org?.name ?? bill.organization?.name ?? "—"}</span></td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(bill.amount)}</td>
                      <td><span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}><Calendar size={12} color="var(--text-muted)" />{bill.dueDate?.split("T")[0] ?? "—"}</span></td>
                      <td><span className={`badge ${conf.cls}`}><Icon size={11} />{conf.label}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {(isPending || isRejected) && (
                            <button
                              className={`btn ${isRejected ? "btn-danger" : "btn-primary"} btn-sm`}
                              style={{ display: "flex", alignItems: "center", gap: 5 }}
                              onClick={() => { setSelectedBill(bill); setModal(true); }}
                            >
                              <Upload size={12} /> {isRejected ? "Upload Ulang" : "Upload Bukti"}
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
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan {filtered.length} dari {bills.length} tagihan</span>
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
      {modal && selectedBill && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="card" style={{ width: "100%", maxWidth: 460, padding: 32, position: "relative" }}>
            <button onClick={() => { setModal(false); setFile(null); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Upload Bukti Pembayaran</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>{selectedBill.title} — {formatCurrency(selectedBill.amount)}</p>
            <form onSubmit={handleUpload}>
              <label style={{ display: "block", border: "2px dashed var(--border)", borderRadius: 10, padding: 36, textAlign: "center", cursor: "pointer", marginBottom: 20 }}>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                <div style={{ width: 48, height: 48, background: "var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Upload size={22} color="var(--primary)" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{file ? file.name : "Klik untuk pilih file"}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>JPG, PNG, PDF — Maks. 5MB</p>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setModal(false); setFile(null); }}>Batal</button>
                <button type="submit" disabled={uploading} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  {uploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />} Kirim Bukti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
