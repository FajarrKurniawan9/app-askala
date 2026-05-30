"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import {
  Trophy, CreditCard, Users, TrendingUp, Clock,
  CheckCircle, AlertCircle, Plus, Eye, Award,
  BookOpen, Calendar, MoreHorizontal, Upload,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Mock Data ──────────────────────────────────────────────── */
const monthlyActivity = [
  { bulan: "Jan", prestasi: 2, kegiatan: 4 },
  { bulan: "Feb", prestasi: 1, kegiatan: 3 },
  { bulan: "Mar", prestasi: 3, kegiatan: 5 },
  { bulan: "Apr", prestasi: 2, kegiatan: 2 },
  { bulan: "Mei", prestasi: 4, kegiatan: 6 },
  { bulan: "Jun", prestasi: 1, kegiatan: 3 },
];

const payments = [
  { id: 1, name: "Iuran OSIS — Juni 2026",     amount: 50000,  status: "pending",  due: "30 Jun 2026" },
  { id: 2, name: "Iuran Paskibra — Mei 2026",  amount: 75000,  status: "paid",     due: "15 Mei 2026" },
  { id: 3, name: "Dana Kegiatan Pensi",         amount: 100000, status: "rejected", due: "1 Jun 2026" },
  { id: 4, name: "Iuran OSIS — Mei 2026",       amount: 50000,  status: "paid",     due: "30 Mei 2026" },
];

const achievements = [
  { title: "Juara 1 Olimpiade Matematika Kab.", type: "Akademik", date: "10 Mei 2026", icon: Trophy },
  { title: "Anggota OSIS Divisi Pendidikan",    type: "Organisasi", date: "2 Jan 2026", icon: Users },
  { title: "Juara 2 Lomba Debat Bahasa Inggris",type: "Akademik", date: "20 Mar 2026", icon: Award },
];

const timeline = [
  { text: "Sertifikat Olimpiade Matematika diupload", time: "2 jam lalu", dot: "primary" },
  { text: "Pembayaran iuran OSIS diverifikasi",       time: "1 hari lalu", dot: "success" },
  { text: "Bergabung dengan Paskibra sekolah",        time: "3 hari lalu", dot: "primary" },
  { text: "Tagihan iuran Paskibra diterima",          time: "5 hari lalu", dot: "danger" },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Menunggu",  cls: "badge-danger" },
  paid:     { label: "Lunas",     cls: "badge-success" },
  rejected: { label: "Ditolak",   cls: "badge-danger" },
};

/* ─── Component ─────────────────────────────────────────────── */
export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" userName="Ahmad Rizky" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar title="Dashboard Siswa" subtitle="Selamat datang kembali, Ahmad! 👋" role="student" setSidebarOpen={setSidebarOpen} />

        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Welcome Card ── */}
          <div style={{
            background: "var(--primary)", borderRadius: 14, padding: "28px 32px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 20,
          }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                Halo, Ahmad Rizky! 🎓
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.8)", marginBottom: 16 }}>
                Kelas XI-IPA 2 • NIS: 2024001234 • SMA Negeri 1 Jakarta
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="/student/portfolio" className="btn btn-sm" style={{
                  background: "rgba(255,255,255,.2)", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.35)", borderRadius: 8,
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                  fontSize: 13, fontWeight: 600, textDecoration: "none", cursor: "pointer",
                }}>
                  <Plus size={14} /> Tambah Prestasi
                </a>
                <a href="/student/payments" className="btn btn-sm" style={{
                  background: "rgba(255,255,255,.12)", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 8,
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                  fontSize: 13, fontWeight: 600, textDecoration: "none", cursor: "pointer",
                }}>
                  <CreditCard size={14} /> Lihat Tagihan
                </a>
              </div>
            </div>
            <div style={{
              background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "16px 24px", textAlign: "center",
            }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
                Semester Ini
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1 }}>12</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}>Total Aktivitas</p>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: Trophy,    label: "Total Prestasi",  value: "7",          sub: "+2 bulan ini",  cls: "" },
              { icon: Users,     label: "Organisasi Aktif",value: "3",          sub: "OSIS, Paskibra, KIR", cls: "" },
              { icon: CreditCard,label: "Tagihan Pending", value: "2",          sub: formatCurrency(125000), cls: "card-stat-danger" },
              { icon: BookOpen,  label: "Kegiatan Diikuti",value: "23",         sub: "Tahun 2026",    cls: "" },
            ].map(({ icon: Icon, label, value, sub, cls }) => (
              <div key={label} className={`card-stat ${cls}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>
                      {value}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
                  </div>
                  <div style={{
                    width: 42, height: 42, background: "var(--primary-light)",
                    borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color="var(--primary)" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Chart + Timeline ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }} className="grid-chart">
            {/* Bar chart */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Aktivitas Bulanan</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Prestasi & kegiatan 2026</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyActivity} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                    cursor={{ fill: "rgba(2,126,116,.06)" }}
                  />
                  <Bar dataKey="prestasi" name="Prestasi" fill="#027E74" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kegiatan" name="Kegiatan" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Timeline */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
                Aktivitas Terbaru
              </h3>
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

          {/* ── Payment Table ── */}
          <div className="card">
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Status Pembayaran</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Tagihan iuran aktif dan riwayat pembayaran</p>
              </div>
              <a href="/student/payments" className="btn btn-outline btn-sm">
                Lihat Semua
              </a>
            </div>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Nama Tagihan</th>
                    <th>Nominal</th>
                    <th>Jatuh Tempo</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</td>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(p.amount)}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                          <Calendar size={12} color="var(--text-muted)" /> {p.due}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusConfig[p.status].cls}`}>
                          {p.status === "paid"
                            ? <CheckCircle size={11} />
                            : <AlertCircle size={11} />}
                          {statusConfig[p.status].label}
                        </span>
                      </td>
                      <td>
                        {p.status === "pending" ? (
                          <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Upload size={12} /> Upload Bukti
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Eye size={12} /> Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Achievements ── */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Prestasi Terbaru</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Pencapaian akademik dan non-akademik</p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} /> Tambah
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {achievements.map((a) => (
                <div key={a.title} style={{
                  border: "1px solid var(--border)", borderRadius: 10, padding: 18,
                  display: "flex", gap: 14, alignItems: "flex-start",
                  transition: "border-color .15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div style={{
                    width: 40, height: 40, background: "var(--primary-light)",
                    borderRadius: 10, display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <a.icon size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{a.title}</p>
                    <span className="badge badge-primary" style={{ fontSize: 10, marginBottom: 4 }}>{a.type}</span>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <Calendar size={10} /> {a.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .grid-chart { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
