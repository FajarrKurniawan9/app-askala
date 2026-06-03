"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import Link from "next/link";
import {
  Trophy, CreditCard, Clock, CheckCircle,
  AlertCircle, Calendar, TrendingUp, Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useParent } from "@/lib/parentContext";
import { useAuthStore, getDisplayName } from "@/store/authStore";
import { parentService } from "@/services/parent.service";
import { submissionService } from "@/services/submission.service";
import { activityService } from "@/services/activity.service";
import { mapSubmissionStatus } from "@/lib/mappers";
import type { ApiParent, ApiStudent, ApiSubmission } from "@/lib/types";
import type { ApiActivity } from "@/services/activity.service";

const ACTIVITY_COLOR: Record<string, string> = {
  Prestasi: "var(--primary)",
  Organisasi: "var(--success)",
  Eskul: "var(--warning)",
  Pembayaran: "var(--text-muted)",
};

export default function ParentDashboard() {
  const { setSidebarOpen } = useParent();
  const { user, parentProfileId, setParentProfileId } = useAuthStore();

  const [parent, setParent] = useState<ApiParent | null>(null);
  const [student, setStudent] = useState<ApiStudent | null>(null);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        // Resolve parent profile
        let parentData: ApiParent | null = null;
        if (parentProfileId) {
          parentData = await parentService.getById(parentProfileId);
        } else {
          const found = await parentService.getByUserId(user.id);
          if (found) {
            parentData = found;
            setParentProfileId(found.id);
          }
        }
        setParent(parentData);

        const firstStudent = parentData?.students?.[0] ?? null;
        setStudent(firstStudent);

        if (firstStudent) {
          const [subs, acts] = await Promise.all([
            submissionService.getAll(),
            activityService.getAll({ studentId: firstStudent.id }),
          ]);
          setSubmissions(subs.filter((s) => s.studentId === firstStudent.id));
          setActivities(acts.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
        setError("Gagal memuat data. Coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, parentProfileId]);

  const pending   = submissions.filter((s) => s.status === "PENDING");
  const verified  = submissions.filter((s) => s.status === "VERIFIED");
  const recentSub = submissions.slice(0, 5);

  const studentName = student
    ? `${student.user.firstName} ${student.user.lastName}`.trim()
    : "—";
  const studentInitials = studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Build simple activity chart from submissions (month count)
  const chartData = (() => {
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const count = submissions.filter((s) => s.createdAt?.startsWith(key)).length;
      return { bulan: months[d.getMonth()], aktivitas: count };
    });
  })();

  if (loading) {
    return (
      <div className="main-content" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="spinner" style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          Memuat data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content" style={{ flex: 1, padding: 24 }}>
        <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: 20, color: "var(--danger)" }}>
          <AlertCircle size={18} style={{ display: "inline", marginRight: 8 }} />{error}
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ flex: 1 }}>
      <Topbar
        title="Dashboard Orang Tua"
        subtitle="Pantau perkembangan putra/putri Anda"
        role="parent"
        setSidebarOpen={setSidebarOpen}
      />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Student Profile Card */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)", borderRadius: 14,
          padding: 28, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            width: 80, height: 80, background: "var(--primary)",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 28, flexShrink: 0,
          }}>{studentInitials || "—"}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              {studentName}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
              {student ? `${student.classRoom}${student.major ? ` • ${student.major}` : ""} • NIS: ${student.nis}` : "Data anak belum tersedia"}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { label: "Kegiatan",    value: String(activities.length) },
                { label: "Tagihan",     value: String(submissions.length) },
                { label: "Belum Bayar", value: String(pending.length) },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "var(--primary-light)", borderRadius: 8, padding: "8px 16px", textAlign: "center",
                }}>
                  <p style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)", lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="badge badge-success" style={{ fontSize: 13, padding: "6px 14px" }}>
              <CheckCircle size={13} /> Siswa Aktif
            </span>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
              {parent ? `Terdaftar: ${new Date(parent.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "short" })}` : ""}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { icon: Trophy,     label: "Total Kegiatan",  value: String(activities.length), sub: "Aktivitas tercatat",         cls: "" },
            { icon: CreditCard, label: "Tagihan Pending", value: String(pending.length),    sub: pending.length > 0 ? formatCurrency(pending.reduce((s, p) => s + (p.bill?.amount ?? 0), 0)) : "Semua lunas", cls: pending.length > 0 ? "card-stat-danger" : "" },
            { icon: TrendingUp, label: "Sudah Dibayar",   value: String(verified.length),  sub: `${submissions.length} total tagihan`, cls: "card-stat-success" },
            { icon: Clock,      label: "Tagihan Total",   value: String(submissions.length), sub: "Semua periode",              cls: "" },
          ].map(({ icon: Icon, label, value, sub, cls }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
                </div>
                <div style={{ width: 42, height: 42, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Activities */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }} className="grid-chart">
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Grafik Aktivitas Pembayaran</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Jumlah transaksi per bulan</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
                <Line type="monotone" dataKey="aktivitas" name="Aktivitas" stroke="#027E74" strokeWidth={2.5} dot={{ fill: "#027E74", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activities */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Aktivitas Terkini</h3>
            {activities.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 32 }}>Belum ada aktivitas</p>
            ) : (
              <div className="timeline">
                {activities.map((a) => {
                  const color = ACTIVITY_COLOR[a.type] ?? "var(--text-muted)";
                  return (
                    <div key={a.id} className="timeline-item">
                      <div className="timeline-dot" style={{ background: color, boxShadow: `0 0 0 2px ${color}` }} />
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{a.title}</p>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{
                          fontSize: 10, background: `${color}15`, color,
                          borderRadius: 999, padding: "2px 8px", fontWeight: 600,
                        }}>{a.type}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={10} /> {new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Riwayat Pembayaran</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Status iuran dan tagihan {studentName}</p>
            </div>
            <Link href="/parent/payments" className="btn btn-outline btn-sm">Lihat Semua</Link>
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Nama Tagihan</th><th>Nominal</th><th>Tanggal</th><th>Status</th><th>Detail</th></tr>
              </thead>
              <tbody>
                {recentSub.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                    Belum ada data pembayaran
                  </td></tr>
                ) : recentSub.map((p) => {
                  const isVerified = p.status === "VERIFIED";
                  const isPending  = p.status === "PENDING";
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.bill?.title ?? "—"}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.bill?.amount ?? 0)}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                          <Calendar size={12} color="var(--text-muted)" />
                          {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isVerified ? "badge-success" : isPending ? "badge-danger" : "badge-gray"}`}>
                          {isVerified ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                          {mapSubmissionStatus(p.status)}
                        </span>
                      </td>
                      <td>
                        <Link href="/parent/payments" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Eye size={13} /> Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      <style>{`
        @media (max-width:900px){.grid-chart{grid-template-columns:1fr!important}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
