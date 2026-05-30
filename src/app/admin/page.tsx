"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import {
  Users, CreditCard, TrendingUp, AlertCircle,
  CheckCircle, Eye, Check, X,
  Plus, Filter, Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const monthlyTx = [
  { bulan: "Jan", pemasukan: 1500000, pengeluaran: 800000 },
  { bulan: "Feb", pemasukan: 2000000, pengeluaran: 1200000 },
  { bulan: "Mar", pemasukan: 1800000, pengeluaran: 950000 },
  { bulan: "Apr", pemasukan: 2400000, pengeluaran: 1600000 },
  { bulan: "Mei", pemasukan: 3000000, pengeluaran: 2100000 },
  { bulan: "Jun", pemasukan: 2200000, pengeluaran: 1400000 },
];

const pieData = [
  { name: "Lunas", value: 65 },
  { name: "Pending", value: 25 },
  { name: "Ditolak", value: 10 },
];
const PIE_COLORS = ["#10B981", "#DC2626", "#64748B"];

const pendingPayments = [
  { id: 1, student: "Ahmad Rizky",   kelas: "XI-IPA 2", tag: "Iuran OSIS Jun",  amount: 50000,  date: "27 Mei 2026" },
  { id: 2, student: "Siti Rahma",    kelas: "XI-IPS 1", tag: "Iuran Paskibra",  amount: 75000,  date: "26 Mei 2026" },
  { id: 3, student: "Bima Prasetyo", kelas: "X-IPA 1",  tag: "Dana Pensi",      amount: 100000, date: "25 Mei 2026" },
  { id: 4, student: "Dian Safitri",  kelas: "XII-IPA 3",tag: "Iuran OSIS Jun",  amount: 50000,  date: "24 Mei 2026" },
  { id: 5, student: "Rizal Anwar",   kelas: "X-IPS 2",  tag: "Iuran KIR",       amount: 30000,  date: "23 Mei 2026" },
];

const students = [
  { name: "Ahmad Rizky",   nis: "2024001234", kelas: "XI-IPA 2", org: 3 },
  { name: "Siti Rahma",    nis: "2024001235", kelas: "XI-IPS 1", org: 2 },
  { name: "Bima Prasetyo", nis: "2024001236", kelas: "X-IPA 1",  org: 4 },
  { name: "Dian Safitri",  nis: "2024001237", kelas: "XII-IPA 3",org: 1 },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="admin" userName="Budi Santoso" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar title="Dashboard Admin" subtitle="Selamat datang, Pak Budi!" role="admin" userName="Budi Santoso" setSidebarOpen={setSidebarOpen} />

        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: Users,      label: "Total Siswa",        value: "1,248", sub: "+12 bulan ini",      cls: "" },
              { icon: AlertCircle,label: "Pembayaran Pending",  value: "37",    sub: "Perlu diverifikasi", cls: "card-stat-danger" },
              { icon: TrendingUp, label: "Total Kas Masuk",     value: "18,5jt",sub: "Bulan Mei 2026",     cls: "card-stat-success" },
              { icon: CreditCard, label: "Transaksi Bulan Ini", value: "143",   sub: "Total semua org",    cls: "" },
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

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }} className="grid-chart">
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Grafik Transaksi Bulanan</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Pemasukan & pengeluaran kas 2026</p>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Download size={13} /> Export
                </button>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyTx} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}jt`} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} cursor={{ fill: "rgba(2,126,116,.06)" }} />
                  <Bar dataKey="pemasukan"   name="Pemasukan"   fill="#027E74" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Status Pembayaran</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Distribusi bulan ini</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i] }} />
                      <span style={{ fontSize: 12, color: "var(--text-body)" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Queue */}
          <div className="card">
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Antrian Verifikasi Pembayaran</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  <span className="badge badge-danger">37 Pending</span>
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Filter size={13} /> Filter
                </button>
                <a href="/admin/payments" className="btn btn-outline btn-sm">Lihat Semua</a>
              </div>
            </div>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Siswa</th><th>Kelas</th><th>Tagihan</th><th>Nominal</th><th>Tanggal</th><th>Status</th><th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, background: "var(--primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "var(--primary)" }}>
                            {p.student.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{p.student}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-gray">{p.kelas}</span></td>
                      <td style={{ fontSize: 13 }}>{p.tag}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.date}</td>
                      <td><span className="badge badge-danger"><AlertCircle size={10} />Pending</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }} title="Lihat Bukti"><Eye size={13} /></button>
                          <button style={{ background: "var(--success)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex" }} title="Terima"><Check size={13} /></button>
                          <button className="btn btn-danger btn-sm" style={{ padding: "5px 8px" }} title="Tolak"><X size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Students Table */}
          <div className="card">
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Siswa Terdaftar</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>1,248 siswa aktif</p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} /> Tambah Siswa
              </button>
            </div>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>Nama</th><th>NIS</th><th>Kelas</th><th>Organisasi</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.nis}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>
                            {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{s.nis}</td>
                      <td><span className="badge badge-primary">{s.kelas}</span></td>
                      <td style={{ fontSize: 13 }}>{s.org} organisasi</td>
                      <td><span className="badge badge-success"><CheckCircle size={10} />Aktif</span></td>
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
