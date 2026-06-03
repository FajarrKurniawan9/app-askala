"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Link from "next/link";
import {
  Trophy, CreditCard, Clock, CheckCircle,
  AlertCircle, Calendar, TrendingUp, Eye, Bell,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const progressData = [
  { bulan: "Jan", skor: 72 },
  { bulan: "Feb", skor: 75 },
  { bulan: "Mar", skor: 80 },
  { bulan: "Apr", skor: 78 },
  { bulan: "Mei", skor: 85 },
  { bulan: "Jun", skor: 88 },
];

const payments = [
  { id: 1, name: "Iuran OSIS — Juni 2026",     amount: 50000,  status: "pending", due: "30 Jun 2026" },
  { id: 2, name: "Iuran Paskibra — Mei 2026",  amount: 75000,  status: "paid",    due: "15 Mei 2026" },
  { id: 3, name: "Dana Kegiatan Pensi",         amount: 100000, status: "paid",    due: "1 Jun 2026" },
];

const activities = [
  { title: "Juara 1 Olimpiade Matematika", type: "Prestasi",   date: "10 Mei 2026", color: "var(--primary)" },
  { title: "Rapat OSIS Bulanan",           type: "Organisasi", date: "5 Mei 2026",  color: "var(--success)" },
  { title: "Latihan Paskibra",             type: "Eskul",      date: "3 Mei 2026",  color: "var(--warning)" },
  { title: "Upload Sertifikat Debat",      type: "Prestasi",   date: "28 Apr 2026", color: "var(--primary)" },
];

const statusBadge: Record<string, { cls: string; label: string }> = {
  pending: { cls: "badge-danger",  label: "Pending" },
  paid:    { cls: "badge-success", label: "Lunas" },
};

export default function ParentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="parent" userName="Ibu Kartini" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar title="Dashboard Orang Tua" subtitle="Pantau perkembangan putra/putri Anda" role="parent" setSidebarOpen={setSidebarOpen} />

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
            }}>AR</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Ahmad Rizky</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
                Kelas XI-IPA 2 • NIS: 2024001234 • SMA Negeri 1 Jakarta
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Organisasi Aktif", value: "3" },
                  { label: "Prestasi",         value: "7" },
                  { label: "Kegiatan",          value: "23" },
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
                Terdaftar sejak Jan 2024
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: Trophy,     label: "Total Prestasi",   value: "7",   sub: "+2 bulan ini",          cls: "" },
              { icon: CreditCard, label: "Tagihan Pending",  value: "1",   sub: formatCurrency(50000),    cls: "card-stat-danger" },
              { icon: TrendingUp, label: "Skor Kehadiran",   value: "97%", sub: "Semester ini",           cls: "card-stat-success" },
              { icon: Bell,       label: "Notifikasi Baru",  value: "3",   sub: "Perlu perhatian",        cls: "" },
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

          {/* Progress Chart + Activities */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }} className="grid-chart">
            {/* Line Chart */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Grafik Perkembangan</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Skor aktivitas bulanan Ahmad Rizky</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="skor" name="Skor" stroke="#027E74" strokeWidth={2.5} dot={{ fill: "#027E74", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activities */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Aktivitas Terkini</h3>
              <div className="timeline">
                {activities.map((a, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" style={{ background: a.color, boxShadow: `0 0 0 2px ${a.color}` }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{a.title}</p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        fontSize: 10, background: `${a.color}15`, color: a.color,
                        borderRadius: 999, padding: "2px 8px", fontWeight: 600,
                      }}>{a.type}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={10} /> {a.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card">
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Riwayat Pembayaran</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Status iuran dan tagihan Ahmad Rizky</p>
              </div>
              <Link href="/parent/payments" className="btn btn-outline btn-sm">Lihat Semua</Link>
            </div>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>Nama Tagihan</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>Detail</th></tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                          <Calendar size={12} color="var(--text-muted)" /> {p.due}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge[p.status].cls}`}>
                          {p.status === "paid" ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                          {statusBadge[p.status].label}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Eye size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
      <style>{`@media (max-width:900px){.grid-chart{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
