"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { useAuthStore } from "@/store/authStore";
import { studentService } from "@/services/student.service";
import { achievementService } from "@/services/portfolio.service";
import { studentOrgService, type ApiStudentOrganization } from "@/services/studentOrganization.service";
import { extracurricularService, type ApiExtracurricular } from "@/services/extracurricular.service";
import { orgService } from "@/services/portfolio.service";
import { toast } from "sonner";
import {
  Plus, Trophy, Users, BookOpen, Upload, Calendar, Search, Trash2, Edit2,
  Award, X, FileDown, CheckCircle, Camera, LayoutGrid, Loader2
} from "lucide-react";
import type { ApiAchievement, ApiStudent, ApiOrganization } from "@/lib/types";
import { mapAchievementType, mapAchievementLevel } from "@/lib/mappers";

type Tab = "all" | "achievements" | "orgs" | "eskul";

// Tipe org form untuk add/edit di portfolio (menggunakan orgId dari org list)
interface OrgFormData { orgId: string; role: string; isActive: boolean; }
interface EskulFormData { name: string; description: string; schedule: string; }

const CAT_COLOR: Record<string, string> = {
  AKADEMIK: "badge-primary",
  ORGANISASI: "badge-success",
  NON_AKADEMIK: "badge-warning",
};

const ov: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const md: React.CSSProperties = { width: "100%", maxWidth: 520, padding: 28, background: "#fff", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,.15)", maxHeight: "90vh", overflowY: "auto" };

export default function PortfolioPage() {
  const { setSidebarOpen } = useStudent();
  const { user, studentProfileId } = useAuthStore();

  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<ApiStudent | null>(null);

  const [profile, setProfile] = useState({
    name: "",
    bio: "Siswa aktif yang bersemangat di bidang akademik, organisasi, dan kegiatan ekstrakurikuler.",
    kelas: "-",
    nis: "-",
  });
  const [profileForm, setProfileForm] = useState(profile);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");

  const [achievements, setAchievements] = useState<ApiAchievement[]>([]);
  const [orgs, setOrgs]   = useState<ApiStudentOrganization[]>([]);
  const [eskuls, setEskuls] = useState<ApiExtracurricular[]>([]);
  const [allAvailOrgs, setAllAvailOrgs] = useState<ApiOrganization[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const [achForm, setAchForm] = useState({ title: "", type: "AKADEMIK", level: "KABUPATEN", position: "", organizer: "", date: "", description: "" });
  const [orgForm, setOrgForm] = useState<OrgFormData>({ orgId: "", role: "", isActive: true });
  const [eskForm, setEskForm] = useState<EskulFormData>({ name: "", description: "", schedule: "" });

  // Load profile, achievements, orgs, and eskuls
  useEffect(() => {
    if (!studentProfileId) {
      setLoading(false);
      return;
    }

    Promise.all([
      studentService.getById(studentProfileId),
      achievementService.getAll({ studentId: studentProfileId }),
      studentOrgService.getAll(),
      extracurricularService.getAll(),
      orgService.getAll(),
    ])
      .then(([studentData, myAchievements, allStudentOrgs, allEskuls, availOrgs]) => {
        setStudent(studentData);
        setProfile({
          name: `${studentData.user.firstName} ${studentData.user.lastName}`,
          bio: studentData.address || "Siswa aktif yang bersemangat di bidang akademik, organisasi, dan kegiatan ekstrakurikuler.",
          kelas: studentData.classRoom,
          nis: studentData.nis,
        });
        setAchievements(myAchievements);
        setOrgs(allStudentOrgs.filter(o => o.studentId === studentProfileId));
        setEskuls(allEskuls.filter(e => e.studentId === studentProfileId));
        setAllAvailOrgs(availOrgs.filter(o => o.isActive));
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat data portofolio.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [studentProfileId]);

  // Save student profile bio / address
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfileId) return;
    try {
      await studentService.update(studentProfileId, {
        address: profileForm.bio,
        nis: profileForm.nis,
        classRoom: profileForm.kelas,
      });
      setProfile(profileForm);
      setShowProfile(false);
      toast.success("Profil portofolio diperbarui!");
    } catch {
      toast.error("Gagal memperbarui profil di server.");
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    if (tab === "achievements") {
      setAchForm({
        title: item.title, type: item.type, level: item.level,
        position: item.position, organizer: item.organizer,
        date: item.date ? item.date.split("T")[0] : "",
        description: item.description || "",
      });
    } else if (tab === "orgs") {
      setOrgForm({ orgId: item.orgId, role: item.role, isActive: item.isActive });
    } else if (tab === "eskul") {
      setEskForm({ name: item.name, description: item.description ?? "", schedule: item.schedule ?? "" });
    }
    setShowAdd(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfileId) return;

    try {
      if (editItem) {
        if (tab === "achievements") {
          const updated = await achievementService.update(editItem.id, {
            title: achForm.title, type: achForm.type as any, level: achForm.level as any,
            position: achForm.position, organizer: achForm.organizer, date: achForm.date,
            description: achForm.description || undefined,
          });
          setAchievements(prev => prev.map(a => a.id === editItem.id ? updated : a));
          toast.success("Prestasi berhasil diperbarui!");
        } else if (tab === "orgs") {
          const updated = await studentOrgService.update(editItem.id, {
            role: orgForm.role, isActive: orgForm.isActive,
          });
          setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
          toast.success("Organisasi berhasil diperbarui!");
        } else if (tab === "eskul") {
          const updated = await extracurricularService.update(editItem.id, {
            name: eskForm.name,
            description: eskForm.description || undefined,
            schedule: eskForm.schedule || undefined,
          });
          setEskuls(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
          toast.success("Eskul berhasil diperbarui!");
        }
      } else {
        if (tab === "achievements") {
          const created = await achievementService.create({
            studentId: studentProfileId,
            title: achForm.title, type: achForm.type as any, level: achForm.level as any,
            position: achForm.position, organizer: achForm.organizer, date: achForm.date,
            description: achForm.description || undefined,
          });
          setAchievements(prev => [created, ...prev]);
          toast.success("Prestasi berhasil ditambahkan!");
        } else if (tab === "orgs") {
          if (!orgForm.orgId) { toast.error("Pilih organisasi terlebih dahulu."); return; }
          const created = await studentOrgService.create({
            studentId: studentProfileId, orgId: orgForm.orgId,
            role: orgForm.role, isActive: orgForm.isActive,
          });
          setOrgs(prev => [created, ...prev]);
          toast.success("Berhasil bergabung ke organisasi!");
        } else if (tab === "eskul") {
          const created = await extracurricularService.create({
            name: eskForm.name, studentId: studentProfileId,
            description: eskForm.description || undefined,
            schedule: eskForm.schedule || undefined,
          });
          setEskuls(prev => [created, ...prev]);
          toast.success("Eskul berhasil ditambahkan!");
        }
      }
      setShowAdd(false);
      setEditItem(null);
    } catch {
      toast.error("Gagal menyimpan data.");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem || !studentProfileId) return;

    try {
      if (tab === "achievements") {
        await achievementService.remove(deleteItem.id);
        setAchievements(prev => prev.filter(a => a.id !== deleteItem.id));
        toast.success("Prestasi berhasil dihapus!");
      } else if (tab === "orgs") {
        await studentOrgService.remove(deleteItem.id);
        setOrgs(prev => prev.filter(o => o.id !== deleteItem.id));
        toast.success("Organisasi berhasil dihapus!");
      } else if (tab === "eskul") {
        await extracurricularService.remove(deleteItem.id);
        setEskuls(prev => prev.filter(ex => ex.id !== deleteItem.id));
        toast.success("Eskul berhasil dihapus!");
      }
      setDeleteItem(null);
    } catch {
      toast.error("Gagal menghapus data.");
    }
  };

  const filtAch = achievements.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  const filtOrg = orgs.filter(o => (o.org?.name ?? "").toLowerCase().includes(search.toLowerCase()));
  const filtEsk = eskuls.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <>
        <Topbar title="Portofolio Digital" subtitle="Dokumentasi prestasi & organisasi Anda" role="student" setSidebarOpen={setSidebarOpen} />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
          <Loader2 size={24} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "var(--text-muted)" }}>Memuat data portofolio...</span>
        </main>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  return (
    <>
      <Topbar title="Portofolio Digital" subtitle="Dokumentasi prestasi & organisasi Anda" role="student" setSidebarOpen={setSidebarOpen} />
      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }} className="portfolio-main">

        {/* Profile Card */}
        <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }} id="portfolio-profile">
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>
              {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <button onClick={() => { setProfileForm(profile); setShowProfile(true); }} style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "var(--primary)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} className="no-print">
              <Camera size={11} color="#fff" />
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{profile.name}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>NIS: {profile.nis} &nbsp;•&nbsp; Kelas {profile.kelas}</p>
            <p style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.6 }}>{profile.bio}</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }} className="no-print">
            <button onClick={() => { setProfileForm(profile); setShowProfile(true); }} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Edit2 size={13} /> Edit Profil
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          {[
            { Icon: Trophy, label: "Total Prestasi", value: achievements.length, color: "var(--primary)" },
            { Icon: Users, label: "Organisasi Aktif", value: orgs.filter(o => o.isActive).length, color: "var(--success)" },
            { Icon: BookOpen, label: "Eskul Aktif", value: eskuls.filter(e => e.isActive).length, color: "var(--warning)" },
            { Icon: Award, label: "Sertifikat", value: achievements.filter(a => a.certificateUrl).length, color: "var(--primary)" },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="card" style={{ padding: 18, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, background: `${color}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <Icon size={18} color={color} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
            {(["all", "achievements", "orgs", "eskul"] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setSearch(""); }} style={{
                padding: "7px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer",
                background: tab === t ? "#fff" : "transparent", color: tab === t ? "var(--primary)" : "var(--text-muted)",
                border: tab === t ? "1px solid var(--border)" : "none",
              }}>
                {t === "all" ? "✨ Semua" : t === "achievements" ? "🏆 Prestasi" : t === "orgs" ? "🏛️ Organisasi" : "🎯 Eskul"}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input className="form-input" style={{ paddingLeft: 36, fontSize: 13 }} placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => window.print()} className="btn btn-ghost btn-sm no-print" style={{ display: "flex", alignItems: "center", gap: 5 }}><FileDown size={14} /> Export PDF</button>
          {tab !== "all" && (
            <button onClick={() => { setEditItem(null); setAchForm({ title: "", type: "AKADEMIK", level: "KABUPATEN", position: "", organizer: "", date: "", description: "" }); setOrgForm({ orgId: "", role: "", isActive: true }); setEskForm({ name: "", description: "", schedule: "" }); setShowAdd(true); }} className="btn btn-primary btn-sm no-print" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Plus size={14} /> {tab === "achievements" ? "Tambah Prestasi" : tab === "orgs" ? "Tambah Organisasi" : "Tambah Eskul"}
            </button>
          )}
        </div>

        {/* Tab: Semua */}
        {tab === "all" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Achievements */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={15} color="var(--primary)" /></div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Prestasi ({achievements.length})</h3>
              </div>
              {achievements.length === 0 ? (
                <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 28, textAlign: "center", color: "var(--text-muted)" }}>Belum ada prestasi</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                  {achievements.map(a => (
                    <div key={a.id} className="card" style={{ padding: 16, borderLeft: "3px solid var(--primary)" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{a.title}</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
                        <span className={`badge ${CAT_COLOR[a.type] || "badge-gray"}`} style={{ fontSize: 11 }}>{mapAchievementType(a.type)}</span>
                        <span className="badge badge-gray" style={{ fontSize: 11 }}>{mapAchievementLevel(a.level)}</span>
                        <span className="badge badge-primary" style={{ fontSize: 11 }}>{a.position}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={10} />{a.date ? a.date.split("T")[0] : ""} • {a.organizer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orgs */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "#dcfce7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={15} color="var(--success)" /></div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Organisasi ({orgs.length})</h3>
              </div>
              {orgs.length === 0 ? (
                <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 28, textAlign: "center", color: "var(--text-muted)" }}>Belum ada organisasi</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                  {orgs.map(o => (
                    <div key={o.id} className="card" style={{ padding: 16, borderLeft: "3px solid var(--success)" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{o.org?.name ?? "Organisasi"}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{o.role}</p>
                      {o.org?.description && <p style={{ fontSize: 12, color: "var(--text-body)", lineHeight: 1.5 }}>{o.org.description}</p>}
                      <span className={`badge ${o.isActive ? "badge-success" : "badge-gray"}`} style={{ fontSize: 11, marginTop: 8 }}>{o.isActive ? "Aktif" : "Selesai"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Eskul */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "#fef3c7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={15} color="var(--warning)" /></div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Ekstrakurikuler ({eskuls.length})</h3>
              </div>
              {eskuls.length === 0 ? (
                <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 28, textAlign: "center", color: "var(--text-muted)" }}>Belum ada eskul</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                  {eskuls.map(ex => (
                    <div key={ex.id} className="card" style={{ padding: 16, borderLeft: "3px solid var(--warning)" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{ex.name}</p>
                      {ex.schedule && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{ex.schedule}</p>}
                      {ex.description && <p style={{ fontSize: 12, color: "var(--text-body)", lineHeight: 1.5 }}>{ex.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements tab */}
        {tab === "achievements" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {filtAch.map(a => (
              <div key={a.id} className="card" style={{ padding: 20, borderTop: "3px solid var(--primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={18} color="var(--primary)" /></div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(a)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteItem(a)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{a.title}</h4>
                {a.description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.6 }}>{a.description}</p>}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  <span className={`badge ${CAT_COLOR[a.type] || "badge-gray"}`}>{mapAchievementType(a.type)}</span>
                  <span className="badge badge-gray">{mapAchievementLevel(a.level)}</span>
                  <span className="badge badge-primary">{a.position}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={10} />{a.date ? a.date.split("T")[0] : ""}</span>
                  {a.certificateUrl ? (
                    <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={11} />Sertifikat ✓</span>
                  ) : (
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}><Upload size={11} />Upload</button>
                  )}
                </div>
              </div>
            ))}
            <div onClick={() => { setEditItem(null); setShowAdd(true); }} style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", minHeight: 180, transition: "all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <div style={{ width: 44, height: 44, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={22} color="var(--primary)" /></div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>Tambah Prestasi Baru</p>
            </div>
          </div>
        )}

        {/* Orgs tab */}
        {tab === "orgs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {filtOrg.map(o => (
              <div key={o.id} className="card" style={{ padding: 24, borderTop: `3px solid ${o.isActive ? "var(--primary)" : "var(--text-muted)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 46, height: 46, background: "var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={22} color="var(--primary)" /></div>
                    <div><h4 style={{ fontSize: 15, fontWeight: 700 }}>{o.org?.name ?? "Organisasi"}</h4><p style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.role}</p></div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(o)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteItem(o)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {o.org?.description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>{o.org.description}</p>}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Bergabung: <strong>{o.createdAt?.split("T")[0] ?? "—"}</strong></span>
                  <span className={`badge ${o.isActive ? "badge-success" : "badge-gray"}`}>{o.isActive ? "Aktif" : "Selesai"}</span>
                </div>
              </div>
            ))}
            <div onClick={() => { setEditItem(null); setShowAdd(true); }} style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", minHeight: 160, transition: "all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <Plus size={24} color="var(--primary)" /><p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>Tambah Organisasi</p>
            </div>
          </div>
        )}

        {/* Eskul tab */}
        {tab === "eskul" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {filtEsk.map(ex => (
              <div key={ex.id} className="card" style={{ padding: 22, borderLeft: "4px solid var(--warning)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={18} color="var(--warning)" /></div>
                    <div><h4 style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</h4>
                      {ex.schedule && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{ex.schedule}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(ex)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteItem(ex)} className="btn btn-ghost btn-sm" style={{ padding: "5px 8px", color: "var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {ex.description && <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{ex.description}</p>}
              </div>
            ))}
            <div onClick={() => { setEditItem(null); setShowAdd(true); }} style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", minHeight: 140, transition: "all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <Plus size={24} color="var(--primary)" /><p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>Tambah Eskul</p>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={ov} onClick={() => { setShowAdd(false); setEditItem(null); }}>
          <div style={md} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{editItem ? "Edit" : "Tambah"} {tab === "achievements" ? "Prestasi" : tab === "orgs" ? "Organisasi" : "Eskul"}</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }} onClick={() => { setShowAdd(false); setEditItem(null); }}><X size={18} /></button>
            </div>
            {tab === "achievements" && (
              <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleAdd}>
                <div><label className="form-label">Judul Prestasi *</label><input className="form-input" required value={achForm.title} onChange={e => setAchForm(f => ({ ...f, title: e.target.value }))} placeholder="Juara 1 Olimpiade Matematika" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="form-label">Kategori</label>
                    <select className="form-input" value={achForm.type} onChange={e => setAchForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="AKADEMIK">Akademik</option>
                      <option value="ORGANISASI">Organisasi</option>
                      <option value="NON_AKADEMIK">Non-Akademik</option>
                    </select></div>
                  <div><label className="form-label">Tingkat</label>
                    <select className="form-input" value={achForm.level} onChange={e => setAchForm(f => ({ ...f, level: e.target.value }))}>
                      <option value="SEKOLAH">Sekolah</option>
                      <option value="KABUPATEN">Kabupaten/Kota</option>
                      <option value="PROVINSI">Provinsi</option>
                      <option value="NASIONAL">Nasional</option>
                      <option value="INTERNASIONAL">Internasional</option>
                    </select></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="form-label">Posisi *</label><input className="form-input" required value={achForm.position} onChange={e => setAchForm(f => ({ ...f, position: e.target.value }))} placeholder="Juara 1" /></div>
                  <div><label className="form-label">Tanggal *</label><input type="date" className="form-input" required value={achForm.date} onChange={e => setAchForm(f => ({ ...f, date: e.target.value }))} /></div>
                </div>
                <div><label className="form-label">Penyelenggara</label><input className="form-input" value={achForm.organizer} onChange={e => setAchForm(f => ({ ...f, organizer: e.target.value }))} placeholder="Dinas Pendidikan" /></div>
                <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={achForm.description} onChange={e => setAchForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setShowAdd(false); setEditItem(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Plus size={14} /> Simpan</button>
                </div>
              </form>
            )}
            {tab === "orgs" && (
              <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleAdd}>
                {!editItem && (
                  <div>
                    <label className="form-label">Pilih Organisasi *</label>
                    <select className="form-input" value={orgForm.orgId} onChange={e => setOrgForm(f => ({ ...f, orgId: e.target.value }))} required>
                      <option value="">— Pilih Organisasi —</option>
                      {allAvailOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="form-label">Jabatan *</label>
                  <input className="form-input" required value={orgForm.role} onChange={e => setOrgForm(f => ({ ...f, role: e.target.value }))} placeholder="Anggota / Ketua / Sekretaris" />
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" id="orgIsActive" checked={orgForm.isActive} onChange={e => setOrgForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--primary)" }} />
                  <label htmlFor="orgIsActive" style={{ fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Masih aktif sebagai anggota</label>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setShowAdd(false); setEditItem(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Plus size={14} /> Simpan</button>
                </div>
              </form>
            )}
            {tab === "eskul" && (
              <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleAdd}>
                <div><label className="form-label">Nama Eskul *</label><input className="form-input" required value={eskForm.name} onChange={e => setEskForm(f => ({ ...f, name: e.target.value }))} placeholder="Futsal, Debat, KIR..." /></div>
                <div><label className="form-label">Jadwal</label><input className="form-input" value={eskForm.schedule} onChange={e => setEskForm(f => ({ ...f, schedule: e.target.value }))} placeholder="Setiap Rabu 15:00 WIB" /></div>
                <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={eskForm.description} onChange={e => setEskForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setShowAdd(false); setEditItem(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Plus size={14} /> Simpan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteItem && (
        <div style={ov} onClick={() => setDeleteItem(null)}>
          <div style={{ ...md, maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "var(--danger-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Trash2 size={24} color="var(--danger)" /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Hapus Data?</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteItem(null)}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfile && (
        <div style={ov} onClick={() => setShowProfile(false)}>
          <div style={{ ...md, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Edit Profil Portofolio</h3>
              <button onClick={() => setShowProfile(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Nama Lengkap *</label>
                <input className="form-input" required value={profileForm.name} readOnly style={{ background: "#f1f5f9" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">NIS</label>
                  <input className="form-input" value={profileForm.nis} readOnly style={{ background: "#f1f5f9" }} />
                </div>
                <div>
                  <label className="form-label">Kelas</label>
                  <input className="form-input" value={profileForm.kelas} readOnly style={{ background: "#f1f5f9" }} />
                </div>
              </div>
              <div>
                <label className="form-label">Bio / Alamat</label>
                <textarea className="form-input" rows={3} value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: "vertical" }} placeholder="Alamat atau biodata singkat..." />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowProfile(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>Simpan Profil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .no-print, .sidebar, nav, header, .topbar-menu-btn,
          [class*="Topbar"] { display: none !important; }
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          body { background: #fff !important; }
          .portfolio-main { padding: 16px !important; gap: 16px !important; }
          #portfolio-profile { border: 1px solid #e2e8f0 !important; break-inside: avoid; }
          .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          [data-print-section] { display: block !important; }
        }
      `}</style>
    </>
  );
}
