"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  Trophy, Calendar, Users, Clock, CheckCircle,
} from "lucide-react";
import { activityService } from "@/services/activity.service";
import { submissionService } from "@/services/submission.service";
import { parentService } from "@/services/parent.service";
import { studentOrgService } from "@/services/studentOrganization.service";
import { mapSubmissionStatus, mapAchievementLevel } from "@/lib/mappers";
import { useParent } from "@/lib/parentContext";
import { useAuthStore } from "@/store/authStore";
import type { ApiSubmission } from "@/lib/types";
import type { ApiActivity } from "@/services/activity.service";
import type { ApiStudentOrganization } from "@/services/studentOrganization.service";

const ACTIVITY_COLOR: Record<string, string> = {
  Prestasi: "var(--primary)",
  Organisasi: "var(--success)",
  Eskul: "var(--warning)",
  Pembayaran: "var(--text-muted)",
};

export default function ParentActivitiesPage() {
  const { setSidebarOpen } = useParent();
  const { user, parentProfileId, setParentProfileId } = useAuthStore();

  const [studentName, setStudentName] = useState("Anak");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [orgs, setOrgs] = useState<ApiStudentOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!firstStudent) {
          setLoading(false);
          return;
        }

        const sName = `${firstStudent.user.firstName} ${firstStudent.user.lastName}`.trim();
        setStudentName(sName);
        setStudentId(firstStudent.id);

        // Fetch all data in parallel
        const [acts, subs, allOrgs] = await Promise.all([
          activityService.getAll({ studentId: firstStudent.id }),
          submissionService.getAll(),
          studentOrgService.getAll(),
        ]);

        setActivities(acts);
        setSubmissions(subs.filter((s) => s.studentId === firstStudent.id));
        setOrgs(allOrgs.filter((o) => o.studentId === firstStudent.id));
      } catch (e) {
        console.error(e);
        setError("Gagal memuat data aktivitas.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, parentProfileId, setParentProfileId]);

  const activeOrgs   = orgs.filter((o) => o.isActive);
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="main-content" style={{ flex: 1 }}>
      <Topbar
        title="Aktivitas Anak"
        subtitle={`Pantau kegiatan dan riwayat ${studentName}`}
        role="parent"
        setSidebarOpen={setSidebarOpen}
      />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {error && (
          <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "14px 18px", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {[
            { label: "Total Kegiatan",   value: loading ? "—" : String(activities.length),                          Icon: Trophy },
            { label: "Organisasi Aktif", value: loading ? "—" : String(activeOrgs.length),                          Icon: Users },
            { label: "Tagihan Pending",  value: loading ? "—" : String(pendingCount),                               Icon: Clock },
            { label: "Total Tagihan",    value: loading ? "—" : String(submissions.length),                         Icon: CheckCircle },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="card-stat">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                </div>
                <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Riwayat Kegiatan</h3>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <Trophy size={36} style={{ opacity: .3, display: "block", margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14 }}>Belum ada aktivitas tercatat</p>
            </div>
          ) : (
            <div className="timeline">
              {activities.map((a) => {
                const color = ACTIVITY_COLOR[a.type] ?? "var(--text-muted)";
                return (
                  <div key={a.id} className="timeline-item">
                    <div className="timeline-dot" style={{ background: color, boxShadow: `0 0 0 2px ${color}` }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{a.title}</p>
                    {a.description && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{a.description}</p>
                    )}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        fontSize: 10, background: `${color}15`, color,
                        borderRadius: 999, padding: "2px 8px", fontWeight: 600,
                      }}>{a.type}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={10} />
                        {new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Submissions */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Riwayat Pembayaran</h3>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <div style={{ width: 24, height: 24, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : submissions.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Belum ada riwayat pembayaran</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {submissions.slice(0, 6).map((s) => {
                const isVerified = s.status === "VERIFIED";
                const isPending  = s.status === "PENDING";
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      background: isVerified ? "rgba(16,185,129,.1)" : isPending ? "rgba(239,68,68,.1)" : "var(--primary-light)",
                    }}>
                      {isVerified
                        ? <CheckCircle size={15} color="var(--success)" />
                        : isPending
                        ? <Clock size={15} color="var(--danger)" />
                        : <Trophy size={15} color="var(--primary)" />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{s.bill?.title ?? "—"}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {s.bill?.org?.name ?? ""} •{" "}
                        {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`badge ${isVerified ? "badge-success" : isPending ? "badge-danger" : "badge-gray"}`}>
                      {mapSubmissionStatus(s.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Org Memberships */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Keanggotaan Organisasi</h3>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <div style={{ width: 24, height: 24, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : orgs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Belum terdaftar di organisasi manapun</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orgs.map((o) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Users size={15} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{o.org?.name ?? "—"}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {o.role} • Sejak {new Date(o.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`badge ${o.isActive ? "badge-success" : "badge-gray"}`}>
                    {o.isActive ? <><CheckCircle size={10} />Aktif</> : "Selesai"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
