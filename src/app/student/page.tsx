"use client";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import {
  Trophy, CreditCard, Users, BookOpen, Clock,
  CheckCircle, AlertCircle, Plus, Eye, Award,
  Calendar, Upload, TrendingUp, ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { mockAchievements, mockStudentOrgs, mockExtracurriculars } from "@/lib/mockData";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Mock data (will come from backend later) ────────────────── */
const monthlyActivity = [
  { bulan: "Jan", prestasi: 2, kegiatan: 4 },
  { bulan: "Feb", prestasi: 1, kegiatan: 3 },
  { bulan: "Mar", prestasi: 3, kegiatan: 5 },
  { bulan: "Apr", prestasi: 2, kegiatan: 3 },
  { bulan: "Mei", prestasi: 4, kegiatan: 6 },
  { bulan: "Jun", prestasi: 1, kegiatan: 2 },
];

const payments = [
  { id: 1, name: "Iuran OSIS — Juni 2026",    amount: 50000,  status: "pending",  due: "30 Jun 2026" },
  { id: 2, name: "Iuran Paskibra — Mei 2026", amount: 75000,  status: "paid",     due: "15 Mei 2026" },
  { id: 3, name: "Dana Kegiatan Pensi",        amount: 100000, status: "rejected", due: "1 Jun 2026" },
  { id: 4, name: "Iuran OSIS — Mei 2026",      amount: 50000,  status: "paid",     due: "30 Mei 2026" },
];

const timeline = [
  { text: "Sertifikat Olimpiade Matematika diupload",  time: "2 jam lalu",  dot: "primary" },
  { text: "Pembayaran iuran OSIS diverifikasi",        time: "1 hari lalu", dot: "success" },
  { text: "Bergabung dengan Paskibra sekolah",         time: "3 hari lalu", dot: "primary" },
  { text: "Tagihan iuran Paskibra diterima",           time: "5 hari lalu", dot: "danger"  },
];

const statusCfg: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:  { label: "Menunggu",  cls: "badge-danger",  icon: <AlertCircle size={11} /> },
  paid:     { label: "Lunas",     cls: "badge-success", icon: <CheckCircle size={11} /> },
  rejected: { label: "Ditolak",   cls: "badge-danger",  icon: <AlertCircle size={11} /> },
};

const CATEGORY_COLOR: Record<string, string> = {
  Akademik: "badge-primary", Organisasi: "badge-success",
  "Non-Akademik": "badge-warning", Olahraga: "badge-danger", Seni: "badge-warning",
};

export default function StudentDashboard() {
  const { setSidebarOpen } = useStudent();

  const totalPending  = payments.filter(p => p.status === "pending").length;
  const totalPendingAmt = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <Topbar
        title="Dashboard Siswa"
        subtitle="Selamat datang kembali, Ahmad! 👋"
        role="student"
        setSidebarOpen={setSidebarOpen}
      />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Welcome Card ─────────────────────────────────────── */}
        <div style={{
          background: "var(--primary)", borderRadius: 14, padding: "28px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              Halo, Ahmad Rizky! 🎓
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.8)", marginBottom: 18 }}>
              Kelas XI-IPA 2 &nbsp;•&nbsp; NIS: 2024001001 &nbsp;•&nbsp; SMA Negeri 3 Malang
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/student/portfolio" style={{
                background: "#fff", color: "var(--primary)", borderRadius: 8,
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                <Plus size={14} /> Tambah Prestasi
              </Link>
              <Link href="/student/payments" style={{
                background: "rgba(255,255,255,.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,.3)",
                borderRadius: 8, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}>
                <CreditCard size={14} /> Lihat Tagihan
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Total Aktivitas", value: "12", sub: "Semester ini" },
              { label: "Prestasi",        value: String(mockAchievements.length), sub: "Tahun 2026" },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,.15)", borderRadius: 12,
                padding: "16px 24px", textAlign: "center", minWidth: 100,
              }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16 }}>
          {[
            { Icon: Trophy,    label: "Total Prestasi",   value: String(mockAchievements.length),    sub: "+2 bulan ini",                   cls: "" },
            { Icon: Users,     label: "Organisasi Aktif", value: String(mockStudentOrgs.filter(o => o.isActive).length), sub: mockStudentOrgs.filter(o=>o.isActive).map(o=>o.orgName).join(", "), cls: "" },
            { Icon: CreditCard,label: "Tagihan Pending",  value: String(totalPending),               sub: formatCurrency(totalPendingAmt),   cls: "card-stat-danger" },
            { Icon: BookOpen,  label: "Eskul Aktif",      value: String(mockExtracurriculars.filter(e=>e.isActive).length), sub: "Futsal, Debate", cls: "" },
          ].map(({ Icon, label, value, sub, cls }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8,
                    textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                  <p style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
                </div>
                <div style={{ width: 44, height: 44, background: "var(--primary-light)", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Timeline ─────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }} className="dash-grid">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Aktivitas Bulanan 2026</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Prestasi & kegiatan</p>
              </div>
              <Link href="/student/portfolio" style={{ textDecoration: "none" }}>
                <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  Lihat Semua <ArrowRight size={13} />
                </button>
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyActivity} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                  cursor={{ fill: "rgba(2,126,116,.06)" }} />
                <Bar dataKey="prestasi" name="Prestasi" fill="#027E74" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kegiatan" name="Kegiatan" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Aktivitas Terbaru</h3>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{
                    background: t.dot === "success" ? "var(--success)" : t.dot === "danger" ? "var(--danger)" : "var(--primary)",
                    boxShadow: `0 0 0 2px ${t.dot === "success" ? "var(--success)" : t.dot === "danger" ? "var(--danger)" : "var(--primary)"}`,
                  }} />
                  <p style={{ fontSize: 13, color: "var(--text-body)", marginBottom: 3 }}>{t.text}</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} /> {t.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Achievements ──────────────────────────────── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Prestasi Terbaru</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Pencapaian akademik dan non-akademik</p>
            </div>
            <Link href="/student/portfolio">
              <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} /> Tambah Prestasi
              </button>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14 }}>
            {mockAchievements.slice(0, 3).map(a => (
              <div key={a.id} style={{
                border: "1px solid var(--border)", borderRadius: 10, padding: 18,
                display: "flex", gap: 14, alignItems: "flex-start", transition: "border-color .15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ width: 42, height: 42, background: "var(--primary-light)", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Trophy size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.4 }}>{a.title}</p>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                    <span className={`badge ${CATEGORY_COLOR[a.category] || "badge-gray"}`} style={{ fontSize: 11 }}>{a.category}</span>
                    <span className="badge badge-gray" style={{ fontSize: 11 }}>{a.level}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={10} /> {a.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Payment Table ────────────────────────────────────── */}
        <div className="card">
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Status Pembayaran</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Tagihan iuran aktif dan riwayat pembayaran</p>
            </div>
            <Link href="/student/payments" className="btn btn-outline btn-sm">Lihat Semua</Link>
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead><tr><th>Nama Tagihan</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {payments.map(p => {
                  const cfg = statusCfg[p.status];
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                      <td><span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}><Calendar size={12} color="var(--text-muted)" /> {p.due}</span></td>
                      <td><span className={`badge ${cfg.cls}`}>{cfg.icon}{cfg.label}</span></td>
                      <td>
                        {p.status === "pending"
                          ? <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}><Upload size={12} /> Upload Bukti</button>
                          : <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}><Eye size={12} /> Detail</button>}
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
        @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
