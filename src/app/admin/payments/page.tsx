"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  AlertCircle, CheckCircle, X, Eye, Check, Download,
  ZoomIn, CreditCard, Clock, Loader2, Trash2,
} from "lucide-react";
import { submissionService } from "@/services/submission.service";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { ApiSubmission, SubmissionStatus } from "@/lib/types";

type TabFilter = "all" | SubmissionStatus;

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const cfg: Record<SubmissionStatus, { cls: string; icon: React.ReactNode; label: string }> = {
    PENDING:  { cls: "badge-warning", icon: <Clock size={10} />,        label: "Pending" },
    VERIFIED: { cls: "badge-success", icon: <CheckCircle size={10} />,  label: "Terverifikasi" },
    REJECTED: { cls: "badge-danger",  icon: <X size={10} />,            label: "Ditolak" },
  };
  const c = cfg[status];
  return <span className={`badge ${c.cls}`}>{c.icon}{c.label}</span>;
}

export default function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const [tab,      setTab]      = useState<TabFilter>("all");
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState<"view" | "reject" | "delete" | null>(null);
  const [selected, setSelected] = useState<ApiSubmission | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await submissionService.getAll();
      setSubmissions(data);
    } catch {
      toast.error("Gagal memuat data pembayaran.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filtered = useMemo(() => {
    return submissions.filter(p => {
      const studentName = p.student?.user
        ? `${p.student.user.firstName} ${p.student.user.lastName}`
        : "";
      const matchTab    = tab === "all" || p.status === tab;
      const matchSearch =
        studentName.toLowerCase().includes(search.toLowerCase()) ||
        (p.bill?.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.student?.nis ?? "").includes(search);
      return matchTab && matchSearch;
    });
  }, [tab, search, submissions]);

  const pendingCount        = submissions.filter(p => p.status === "PENDING").length;
  const verifiedCount       = submissions.filter(p => p.status === "VERIFIED").length;
  const rejectedCount       = submissions.filter(p => p.status === "REJECTED").length;
  const totalVerifiedAmount = submissions
    .filter(p => p.status === "VERIFIED")
    .reduce((s, p) => s + (p.bill?.amount ?? 0), 0);

  async function handleVerify(sub: ApiSubmission) {
    if (!user?.id) {
      toast.error("Sesi tidak valid. Silakan login ulang.");
      return;
    }
    setActionLoading(true);
    try {
      const updated = await submissionService.verify(sub.id, String(user.id));
      setSubmissions(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (modal === "view") setSelected(updated);
      toast.success("Pembayaran berhasil diverifikasi!");
    } catch {
      toast.error("Gagal memverifikasi pembayaran.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(sub: ApiSubmission) {
    if (!rejectNote.trim()) {
      toast.error("Isi alasan penolakan terlebih dahulu.");
      return;
    }
    setActionLoading(true);
    try {
      const updated = await submissionService.reject(sub.id, rejectNote.trim());
      setSubmissions(prev => prev.map(p => p.id === updated.id ? updated : p));
      setModal(null);
      setRejectNote("");
      toast.success("Pembayaran berhasil ditolak.");
    } catch {
      toast.error("Gagal menolak pembayaran.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(sub: ApiSubmission) {
    setActionLoading(true);
    try {
      await submissionService.remove(sub.id);
      setSubmissions(prev => prev.filter(p => p.id !== sub.id));
      setModal(null);
      toast.success("Submission berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus submission.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Verifikasi Pembayaran" subtitle="Verifikasi bukti transfer pembayaran siswa" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {[
            { label: "Menunggu Verifikasi",  value: loading ? "..." : pendingCount,                         cls: "card-stat-danger",  icon: AlertCircle },
            { label: "Terverifikasi",         value: loading ? "..." : verifiedCount,                        cls: "card-stat-success", icon: CheckCircle },
            { label: "Ditolak",               value: loading ? "..." : rejectedCount,                        cls: "card-stat",         icon: X },
            { label: "Total Nominal Masuk",   value: loading ? "..." : formatCurrency(totalVerifiedAmount),  cls: "card-stat",         icon: CreditCard },
          ].map(({ label, value, cls, icon: Icon }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: typeof value === "string" && value.startsWith("Rp") ? 18 : 28, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
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
                ["all",      "Semua",          submissions.length],
                ["PENDING",  "Pending",         pendingCount],
                ["VERIFIED", "Terverifikasi",   verifiedCount],
                ["REJECTED", "Ditolak",         rejectedCount],
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
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      <span>Memuat data...</span>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <CreditCard size={32} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                    Tidak ada data pembayaran
                  </td></tr>
                ) : filtered.map(p => {
                  const studentName = p.student?.user
                    ? `${p.student.user.firstName} ${p.student.user.lastName}`
                    : "Siswa Askala";
                  const orgName = p.bill?.org?.name ?? p.bill?.organization?.name ?? "—";
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, background: "var(--primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "var(--primary)", flexShrink: 0 }}>
                            {studentName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13 }}>{studentName}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.student?.classRoom ?? ""} · {p.student?.nis ?? ""}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{p.bill?.title ?? p.billId}</td>
                      <td><span className="badge badge-primary">{orgName}</span></td>
                      <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(p.bill?.amount ?? 0)}</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                      <td>
                        {p.fileUrl ? (
                          <a href={p.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                            <ZoomIn size={13} /> Lihat
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        {p.status === "PENDING" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleVerify(p)}
                              disabled={actionLoading}
                              style={{ background: "var(--success)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                              <Check size={13} /> Verifikasi
                            </button>
                            <button
                              onClick={() => { setSelected(p); setModal("reject"); }}
                              style={{ background: "var(--danger)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                              <X size={13} /> Tolak
                            </button>
                          </div>
                        ) : p.status === "VERIFIED" ? (
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            Oleh: {p.verifiedBy ?? "Admin"}
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => { setSelected(p); setModal("view"); }}>
                              <Eye size={13} /> Detail
                            </button>
                            <button
                              onClick={() => { setSelected(p); setModal("delete"); }}
                              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "var(--danger)", display: "flex", alignItems: "center" }}
                              title="Hapus submission">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menampilkan {filtered.length} dari {submissions.length} transaksi</span>
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

            {/* Proof image */}
            <div style={{ background: "var(--bg)", border: "1px dashed var(--border)", borderRadius: 8, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, gap: 8, overflow: "hidden" }}>
              {selected.fileUrl ? (
                <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--primary)" }}>
                  <ZoomIn size={32} color="var(--primary)" />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Klik untuk lihat bukti transfer</p>
                  <span className="badge badge-primary" style={{ fontSize: 11 }}>Buka di tab baru</span>
                </a>
              ) : (
                <>
                  <ZoomIn size={32} color="var(--text-muted)" />
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Bukti tidak tersedia</p>
                </>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                ["Nama Siswa",   selected.student?.user ? `${selected.student.user.firstName} ${selected.student.user.lastName}` : "—"],
                ["NIS",          selected.student?.nis ?? "—"],
                ["Kelas",        selected.student?.classRoom ?? "—"],
                ["Tagihan",      selected.bill?.title ?? selected.billId],
                ["Organisasi",   selected.bill?.org?.name ?? selected.bill?.organization?.name ?? "—"],
                ["Nominal",      formatCurrency(selected.bill?.amount ?? 0)],
                ["Tanggal",      new Date(selected.createdAt).toLocaleDateString("id-ID")],
                ["Status",       selected.status === "PENDING" ? "Menunggu" : selected.status === "VERIFIED" ? "Terverifikasi" : "Ditolak"],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{lbl}</p>
                  <p style={{ fontSize: 14 }}>{val}</p>
                </div>
              ))}
            </div>

            {selected.note && (
              <div style={{ background: "var(--danger-light)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>Catatan: {selected.note}</p>
              </div>
            )}

            {selected.status === "PENDING" && (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleVerify(selected)}
                  disabled={actionLoading}
                  style={{ flex: 1, background: "var(--success)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={15} />} Verifikasi
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
                Pembayaran <strong>{selected.bill?.title ?? "ini"}</strong> dari{" "}
                <strong>
                  {selected.student?.user
                    ? `${selected.student.user.firstName} ${selected.student.user.lastName}`
                    : "siswa ini"}
                </strong>
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Alasan penolakan *</label>
              <textarea className="form-input" rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai..." style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setModal(null); setRejectNote(""); }}>Batal</button>
              <button
                className="btn btn-danger" style={{ flex: 1 }}
                disabled={actionLoading}
                onClick={() => handleReject(selected)}>
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
                Tolak Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Submission ──────────────────────── */}
      {modal === "delete" && selected && (
        <div style={overlayStyle} onClick={() => setModal(null)}>
          <div className="card" style={{ ...modalStyle, maxWidth: 400, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Submission?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}>
              Submission dari <strong>{selected.student?.user ? `${selected.student.user.firstName} ${selected.student.user.lastName}` : "siswa ini"}</strong> akan dihapus permanen.
            </p>
            <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 24 }}>
              ⚠️ Catatan: menghapus submission yang sudah VERIFIED tidak membatalkan transaksi kas yang sudah tercatat.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>Batal</button>
              <button
                className="btn btn-danger" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                disabled={actionLoading}
                onClick={() => handleDelete(selected)}>
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                {actionLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalStyle: React.CSSProperties = { width: "100%", maxWidth: 560, padding: 28, position: "relative", maxHeight: "90vh", overflowY: "auto" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" };
