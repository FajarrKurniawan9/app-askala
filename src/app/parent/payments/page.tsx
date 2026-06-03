"use client";
import { useState, useMemo, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  CheckCircle, AlertCircle, Clock, Calendar, CreditCard, Eye, X, ZoomIn,
} from "lucide-react";
import { submissionService } from "@/services/submission.service";
import { parentService } from "@/services/parent.service";
import { formatCurrency } from "@/lib/utils";
import { mapSubmissionStatus } from "@/lib/mappers";
import { useParent } from "@/lib/parentContext";
import { useAuthStore } from "@/store/authStore";
import type { ApiSubmission, SubmissionStatus } from "@/lib/types";

const STATUS_CFG: Record<SubmissionStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Menunggu",      cls: "badge-danger",  icon: <Clock size={10} /> },
  VERIFIED: { label: "Lunas",         cls: "badge-success", icon: <CheckCircle size={10} /> },
  REJECTED: { label: "Ditolak",       cls: "badge-danger",  icon: <AlertCircle size={10} /> },
};

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
  zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};

export default function ParentPaymentsPage() {
  const { setSidebarOpen } = useParent();
  const { user, parentProfileId, setParentProfileId } = useAuthStore();

  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [studentName, setStudentName] = useState("Anak");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<ApiSubmission | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        // Resolve parent → student
        let parentData = null;
        if (parentProfileId) {
          parentData = await parentService.getById(parentProfileId);
        } else {
          const found = await parentService.getByUserId(user.id);
          if (found) {
            parentData = found;
            setParentProfileId(found.id);
          }
        }

        const firstStudent = parentData?.students?.[0];
        if (firstStudent) {
          const name = `${firstStudent.user.firstName} ${firstStudent.user.lastName}`.trim();
          setStudentName(name);
          const all = await submissionService.getAll();
          setSubmissions(all.filter((s) => s.studentId === firstStudent.id));
        }
      } catch (e) {
        console.error(e);
        setError("Gagal memuat data pembayaran.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, parentProfileId]);

  const filtered = useMemo(
    () => submissions.filter((p) => filter === "all" || p.status === filter),
    [filter, submissions]
  );

  const totalPending  = submissions.filter((p) => p.status === "PENDING").reduce((s, p) => s + (p.bill?.amount ?? 0), 0);
  const totalVerified = submissions.filter((p) => p.status === "VERIFIED").reduce((s, p) => s + (p.bill?.amount ?? 0), 0);
  const pendingCount  = submissions.filter((p) => p.status === "PENDING").length;

  return (
    <div className="main-content" style={{ flex: 1 }}>
      <Topbar
        title="Status Pembayaran"
        subtitle={`Riwayat iuran dan tagihan ${studentName}`}
        role="parent"
        setSidebarOpen={setSidebarOpen}
      />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {[
            { label: "Belum Dibayar", value: formatCurrency(totalPending),          cls: "card-stat-danger",  Icon: AlertCircle },
            { label: "Sudah Dibayar", value: formatCurrency(totalVerified),         cls: "card-stat-success", Icon: CheckCircle },
            { label: "Total Tagihan", value: `${submissions.length} tagihan`,       cls: "card-stat",         Icon: CreditCard },
          ].map(({ label, value, cls, Icon }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{loading ? "—" : value}</p>
                </div>
                <div style={{ width: 38, height: 38, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert jika ada pending */}
        {!loading && pendingCount > 0 && (
          <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 2 }}>
                {pendingCount} Tagihan Belum Dibayar
              </p>
              <p style={{ fontSize: 13, color: "var(--text-body)" }}>
                {studentName} memiliki {pendingCount} tagihan yang belum diselesaikan.
                Total kewajiban: <strong>{formatCurrency(totalPending)}</strong>
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "14px 18px", color: "var(--danger)" }}>
            <AlertCircle size={15} style={{ display: "inline", marginRight: 8 }} />{error}
          </div>
        )}

        {/* Table */}
        <div className="card">
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {([
              ["all",      "Semua"],
              ["PENDING",  "Menunggu"],
              ["VERIFIED", "Lunas"],
              ["REJECTED", "Ditolak"],
            ] as ["all" | SubmissionStatus, string][]).map(([v, lbl]) => (
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
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      Memuat data...
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    <CreditCard size={32} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
                    Tidak ada data pembayaran
                  </td></tr>
                ) : filtered.map((p) => {
                  const cfg = STATUS_CFG[p.status];
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.bill?.title ?? "—"}</td>
                      <td>
                        {p.bill?.org?.name
                          ? <span className="badge badge-primary">{p.bill.org.name}</span>
                          : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                        }
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(p.bill?.amount ?? 0)}</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={11} />
                          {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
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
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Menampilkan {filtered.length} dari {submissions.length} tagihan
            </span>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {modal && selected && (
        <div style={overlay} onClick={() => setModal(false)}>
          <div className="card" style={{ width: "100%", maxWidth: 460, padding: 28, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Detail Pembayaran</h3>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            {/* Bukti file */}
            {selected.fileUrl ? (
              <a href={selected.fileUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginBottom: 20 }}>
                <img src={selected.fileUrl} alt="Bukti Transfer"
                  style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8, border: "1px solid var(--border)" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <p style={{ fontSize: 11, color: "var(--primary)", marginTop: 6, textAlign: "center" }}>Klik untuk buka di tab baru</p>
              </a>
            ) : (
              <div style={{ background: "var(--bg)", border: "1px dashed var(--border)", borderRadius: 8, height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, gap: 6 }}>
                <ZoomIn size={28} color="var(--text-muted)" />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Belum ada bukti transfer</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              {[
                ["Tagihan",    selected.bill?.title ?? "—"],
                ["Organisasi", selected.bill?.org?.name ?? "—"],
                ["Nominal",    formatCurrency(selected.bill?.amount ?? 0)],
                ["Tanggal",    new Date(selected.createdAt).toLocaleDateString("id-ID")],
                ["Status",     mapSubmissionStatus(selected.status)],
                ...(selected.note ? [["Catatan", selected.note]] : []),
                ...(selected.verifiedAt ? [["Diverifikasi", new Date(selected.verifiedAt).toLocaleDateString("id-ID")]] : []),
              ].map(([l, v]) => (
                <div key={String(l)}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{String(l)}</p>
                  <p style={{ fontSize: 14 }}>{String(v)}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => setModal(false)}>Tutup</button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
