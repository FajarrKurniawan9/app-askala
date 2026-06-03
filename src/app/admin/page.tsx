"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  Users, CreditCard, TrendingUp, AlertCircle,
  CheckCircle, Eye, Check, X, Plus, Download, Filter,
  ArrowRight, Activity,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { treasuryService } from "@/services/treasury.service";
import type { ApiStudent, ApiSubmission } from "@/lib/types";
import type { ApiTreasury } from "@/services/treasury.service";

const PIE_COLORS = ["#10B981", "#F59E0B", "#DC2626"];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  // ── Solusi Nama Undefined: Validasi & Fallback Berlapis ──
  const userName = user
    ? (user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user.email?.split("@")[0] || "Admin")
    : "Admin";

  // ── State untuk data dari API ───────────────────────────────
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<ApiSubmission[]>([]);
  const [treasuryData, setTreasuryData] = useState<ApiTreasury[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingTreasury, setLoadingTreasury] = useState(true);

  // ── Fetch semua data siswa dari Backend ──────────────────────
  useEffect(() => {
    api.get<ApiStudent[]>("/students")
      .then(res => setStudents(res.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, []);

  // ── Fetch keseluruhan submission/pembayaran dari Backend ────
  useEffect(() => {
    api.get<ApiSubmission[]>("/submissions")
      .then(res => setAllSubmissions(res.data || []))
      .catch(() => setAllSubmissions([]))
      .finally(() => setLoadingPayments(false));
  }, []);

  // ── Fetch data treasury dari Backend ────────────────────────
  useEffect(() => {
    treasuryService.getAll()
      .then(data => setTreasuryData(data))
      .catch(() => setTreasuryData([]))
      .finally(() => setLoadingTreasury(false));
  }, []);

  // ── Handle Aksi Verifikasi Pembayaran ───────────────────────
  async function handleVerify(id: string) {
    try {
      await api.patch(`/submissions/${id}`, {
        status: "VERIFIED",
        verifiedBy: String(user?.id ?? ""),
      });
      setAllSubmissions(prev =>
        prev.map(p => p.id === id ? { ...p, status: "VERIFIED" } : p)
      );
    } catch {
      alert("Gagal memverifikasi. Coba lagi.");
    }
  }

  // ── Handle Aksi Tolak Pembayaran ────────────────────────────
  async function handleReject(id: string) {
    try {
      await api.patch(`/submissions/${id}`, {
        status: "REJECTED",
      });
      setAllSubmissions(prev =>
        prev.map(p => p.id === id ? { ...p, status: "REJECTED" } : p)
      );
    } catch {
      alert("Gagal menolak. Coba lagi.");
    }
  }

  // ── Pemrosesan Logika Statistik Dinamis (Live Backend) ─────
  const totalStudents = students.length;

  // Ambil antrian data pembayaran yang berstatus PENDING saja
  const pendingPaymentsQueue = allSubmissions.filter(p => p.status === "PENDING");
  const totalPending = pendingPaymentsQueue.length;

  // Hitung Total Kas dari /treasury (IN - OUT)
  const totalKasIN  = treasuryData.filter(t => t.type === "IN").reduce((s, t) => s + t.amount, 0);
  const totalKasOUT = treasuryData.filter(t => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
  const totalKasMasuk = totalKasIN;  // kas masuk total dari treasury

  // Total Transaksi Keseluruhan yang tercatat di backend
  const totalTransaksiKeseluruhan = allSubmissions.length;

  // ── Pemrosesan Data Pie Chart Dinamis ────────────────────────
  const totalSubmissionsCount = allSubmissions.length || 1; // Menghindari pembagian dengan angka 0
  const verifiedCount = allSubmissions.filter(p => p.status === "VERIFIED").length;
  const rejectedCount = allSubmissions.filter(p => p.status === "REJECTED").length;

  const pieData = [
    { name: "Terverifikasi", value: Math.round((verifiedCount / totalSubmissionsCount) * 100) },
    { name: "Pending", value: Math.round((totalPending / totalSubmissionsCount) * 100) },
    { name: "Ditolak", value: Math.round((rejectedCount / totalSubmissionsCount) * 100) },
  ];

  // ── Pemrosesan Data Bar Chart Bulanan — dari treasury data ──
  const namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthlyChartData = namaBulan.map((bulan, index) => {
    const txBulanIni = treasuryData.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === index;
    });
    return {
      bulan,
      pemasukan: txBulanIni.filter(t => t.type === "IN").reduce((s, t) => s + t.amount, 0),
    };
  });

  const statCards = [
    { icon: Users,        label: "Total Siswa",          value: loadingStudents  ? "..." : String(totalStudents),            sub: "Siswa terdaftar",          cls: "",                  href: "/admin/students" },
    { icon: AlertCircle,  label: "Pembayaran Pending",   value: loadingPayments  ? "..." : String(totalPending),             sub: "Perlu diverifikasi",       cls: "card-stat-danger",  href: "/admin/payments" },
    { icon: TrendingUp,   label: "Total Kas Masuk",      value: loadingTreasury  ? "..." : formatCurrency(totalKasMasuk),    sub: "Dari transaksi treasury",  cls: "card-stat-success", href: "/admin/treasury" },
    { icon: CreditCard,   label: "Transaksi Keseluruhan",value: loadingPayments  ? "..." : String(totalTransaksiKeseluruhan),sub: "Semua riwayat submit",     cls: "",                  href: "/admin/payments" },
  ];

  return (
    <>
      <Topbar
        title="Dashboard Admin"
        subtitle={`Selamat datang kembali, ${userName}!`}
        role="admin"
        setSidebarOpen={setSidebarOpen}
      />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div className="stats-grid">
          {statCards.map(({ icon: Icon, label, value, sub, cls, href }) => (
            <Link key={label} href={href} className={`card-stat ${cls}`}
              style={{ textDecoration: "none", display: "block", transition: "transform .15s, box-shadow .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6 }}>{value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
                </div>
                <div style={{ width: 44, height: 44, background: "var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Charts ─────────────────────────────────────────────── */}
        <div className="chart-grid">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Grafik Pemasukan Bulanan</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Pemasukan kas real-time 2026</p>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Download size={13} /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp ${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatCurrency(Number(v || 0))} cursor={{ fill: "rgba(2,126,116,.06)" }} />
                <Bar dataKey="pemasukan" name="Pemasukan" fill="#027E74" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {[{ color: "#027E74", label: "Pemasukan Terverifikasi" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Status Pembayaran</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Distribusi data submit keseluruhan</p>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${Number(v ?? 0)}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i] }} />
                    <span style={{ fontSize: 13, color: "var(--text-body)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{isNaN(d.value) ? 0 : d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ──────────────────────────────────────── */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 12 }}>Aksi Cepat</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/admin/students", icon: Users, label: "Tambah Siswa", cls: "btn-primary" },
              { href: "/admin/payments", icon: CheckCircle, label: "Verifikasi Bayar", cls: "btn-outline" },
              { href: "/admin/treasury", icon: TrendingUp, label: "Catat Kas", cls: "btn-outline" },
              { href: "/admin/activities", icon: Activity, label: "Buat Kegiatan", cls: "btn-outline" },
            ].map(({ href, icon: Icon, label, cls }) => (
              <Link key={href} href={href} className={`btn ${cls} btn-sm`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={14} /> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Verification Queue ─────────────────────────────────── */}
        <div className="card">
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Antrian Verifikasi Pembayaran</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                <span className="badge badge-danger">{loadingPayments ? "..." : totalPending} Pending</span>
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Filter size={13} /> Filter
              </button>
              <Link href="/admin/payments" className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                Lihat Semua <ArrowRight size={13} />
              </Link>
            </div>
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Siswa</th><th>Tagihan</th><th>Nominal</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {loadingPayments ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Memuat data...</td></tr>
                ) : pendingPaymentsQueue.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Tidak ada pembayaran pending</td></tr>
                ) : pendingPaymentsQueue.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "var(--primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "var(--primary)", flexShrink: 0 }}>
                          {p.student?.user?.firstName?.[0] ?? "?"}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {p.student?.user ? `${p.student.user.firstName} ${p.student.user.lastName}` : "Siswa Askala"}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{p.bill?.title ?? p.billId}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.bill?.amount ?? 0)}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                    <td><span className="badge badge-warning"><AlertCircle size={10} />Pending</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href="/admin/payments" className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }} title="Lihat Detail">
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => handleVerify(p.id)}
                          style={{ background: "var(--success)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}
                          title="Verifikasi"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          style={{ background: "var(--danger)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}
                          title="Tolak"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recent Students ────────────────────────────────────── */}
        <div className="card">
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Siswa Terdaftar</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {loadingStudents ? "Memuat..." : `${totalStudents} siswa aktif`}
              </p>
            </div>
            <Link href="/admin/students" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Plus size={13} /> Tambah Siswa
            </Link>
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Nama</th><th>NIS</th><th>Kelas</th><th>Jurusan</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {loadingStudents ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Memuat data...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Tidak ada data siswa</td></tr>
                ) : students.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {s.user?.firstName?.[0] ?? ""}{s.user?.lastName?.[0] ?? ""}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>
                            {s.user ? `${s.user.firstName} ${s.user.lastName}` : "Siswa Askala"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.user?.email ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{s.nis}</td>
                    <td><span className="badge badge-primary">{s.classRoom}</span></td>
                    <td style={{ fontSize: 13 }}>{s.major ?? "-"}</td>
                    <td><span className="badge badge-success"><CheckCircle size={10} />Aktif</span></td>
                    <td>
                      <Link href="/admin/students" className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}>
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <Link href="/admin/students" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Lihat semua siswa <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </main>

      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .chart-grid  { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px)  { .chart-grid  { grid-template-columns: 1fr; } }
        @media (max-width: 600px)  { .stats-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}