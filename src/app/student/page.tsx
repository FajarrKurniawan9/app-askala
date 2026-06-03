"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { useAuthStore } from "@/store/authStore";
import { achievementService } from "@/services/portfolio.service";
import { billService } from "@/services/bill.service";
import { submissionService } from "@/services/submission.service";
import { orgService } from "@/services/portfolio.service";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import {
  Trophy, CreditCard, AlertCircle, CheckCircle, Calendar,
  TrendingUp, Users, Loader2, ArrowRight,
} from "lucide-react";
import type { ApiAchievement, ApiBill, ApiSubmission, ApiOrganization } from "@/lib/types";
import { mapAchievementType, mapAchievementLevel } from "@/lib/mappers";

export default function StudentDashboard() {
  const { setSidebarOpen } = useStudent();
  const { user, studentProfileId } = useAuthStore();

  const [achievements, setAchievements] = useState<ApiAchievement[]>([]);
  const [bills, setBills] = useState<ApiBill[]>([]);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [orgs, setOrgs] = useState<ApiOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentProfileId
        ? achievementService.getAll({ studentId: studentProfileId })
        : Promise.resolve([] as typeof achievements),
      billService.getAll(),
      submissionService.getAll(),
      orgService.getAll(),
    ])
      .then(([ach, b, sub, org]) => {
        setAchievements(ach);
        setBills(b);
        setSubmissions(sub);
        setOrgs(org);
      })
      .catch(() => toast.error("Gagal memuat data dashboard."))
      .finally(() => setLoading(false));
  }, [studentProfileId]);

  const pendingBills = bills.filter(b => {
    const sub = submissions.find(s => s.billId === b.id);
    return !sub || sub.status === "PENDING";
  });
  const verifiedAmount = submissions
    .filter(s => s.status === "VERIFIED")
    .reduce((sum, s) => sum + (s.bill?.amount ?? 0), 0);
  const activeOrgs = orgs.filter(o => o.isActive).length;

  if (loading) return (
    <>
      <Topbar title="Dashboard" subtitle="Ringkasan aktivitas Anda" role="student" setSidebarOpen={setSidebarOpen} />
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <Loader2 size={24} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "var(--text-muted)" }}>Memuat dashboard...</span>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Selamat datang, ${user?.firstName ?? "Siswa"}!`} role="student" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {[
            { icon: Trophy,     label: "Total Prestasi",  value: String(achievements.length),       sub: "Data dari server",          cls: "" },
            { icon: AlertCircle,label: "Tagihan Pending", value: String(pendingBills.length),         sub: `${pendingBills.length} belum dibayar`, cls: pendingBills.length > 0 ? "card-stat-danger" : "" },
            { icon: CheckCircle,label: "Sudah Dibayar",   value: formatCurrency(verifiedAmount),     sub: "Total terverifikasi",       cls: "card-stat-success" },
            { icon: Users,      label: "Organisasi",      value: String(activeOrgs),                 sub: "Organisasi aktif",          cls: "" },
          ].map(({ icon: Icon, label, value, sub, cls }) => (
            <div key={label} className={`card-stat ${cls}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
                </div>
                <div style={{ width: 42, height: 42, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 12 }}>Aksi Cepat</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/student/achievements", icon: TrendingUp, label: "Tambah Prestasi", cls: "btn-primary" },
              { href: "/student/payments",     icon: CreditCard, label: "Upload Bukti Bayar", cls: "btn-outline" },
              { href: "/student/portfolio",    icon: Trophy,     label: "Lihat Portofolio", cls: "btn-outline" },
              { href: "/student/organizations",icon: Users,      label: "Organisasi", cls: "btn-outline" },
            ].map(({ href, icon: Icon, label, cls }) => (
              <Link key={href} href={href} className={`btn ${cls} btn-sm`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={14} /> {label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }} className="dash-grid">
          {/* Recent Achievements */}
          <div className="card">
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Prestasi Terbaru</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{achievements.length} total prestasi</p>
              </div>
              <Link href="/student/achievements" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                Lihat Semua <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {achievements.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                  <Trophy size={32} style={{ margin: "0 auto 8px", opacity: .3 }} />
                  <p style={{ fontSize: 13 }}>Belum ada prestasi</p>
                </div>
              ) : achievements.slice(0, 4).map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Trophy size={15} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</p>
                    <div style={{ display: "flex", gap: 5 }}>
                      <span className="badge badge-primary" style={{ fontSize: 11 }}>{a.position}</span>
                      <span className="badge badge-gray" style={{ fontSize: 11 }}>{mapAchievementLevel(a.level)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={10} />{a.date.split("T")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tagihan Pending */}
          <div className="card">
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Tagihan Aktif</h3>
              <Link href="/student/payments" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                Semua <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {bills.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                  <CreditCard size={32} style={{ margin: "0 auto 8px", opacity: .3 }} />
                  <p style={{ fontSize: 13 }}>Tidak ada tagihan</p>
                </div>
              ) : bills.slice(0, 4).map(b => {
                const sub = submissions.find(s => s.billId === b.id);
                const isPending = !sub || sub.status === "PENDING";
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: isPending ? "var(--danger-light)" : "var(--bg)", borderRadius: 8, border: `1px solid ${isPending ? "rgba(220,38,38,.15)" : "var(--border)"}` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{b.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatCurrency(b.amount)}</p>
                    </div>
                    <span className={`badge ${sub?.status === "VERIFIED" ? "badge-success" : "badge-danger"}`} style={{ fontSize: 11 }}>
                      {sub?.status === "VERIFIED" ? "Lunas" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .dash-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
