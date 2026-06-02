"use client";
import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { mockAchievements, mockStudentOrgs, mockExtracurriculars } from "@/lib/mockData";
import type { Achievement, StudentOrg, Extracurricular } from "@/lib/types";
import { toast } from "sonner";
import { Plus, Trophy, Users, BookOpen, Upload, Calendar, Search, Trash2, Edit2, Award, X, FileDown, CheckCircle, Camera, LayoutGrid } from "lucide-react";

type Tab = "all" | "achievements" | "orgs" | "eskul";

const CAT_COLOR: Record<string, string> = {
  Akademik: "badge-primary", Organisasi: "badge-success",
  "Non-Akademik": "badge-warning", Olahraga: "badge-danger", Seni: "badge-warning",
};
const ov: React.CSSProperties = { position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 };
const md: React.CSSProperties = { width:"100%",maxWidth:520,padding:28,background:"#fff",borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,.15)",maxHeight:"90vh",overflowY:"auto" };

const PROFILE_DEFAULT = { name: "Ahmad Rizky Pratama", bio: "Siswa aktif kelas XI-IPA 2 yang bersemangat di bidang akademik, organisasi, dan kegiatan ekstrakurikuler.", kelas: "XI-IPA 2", nis: "2024001001" };

export default function PortfolioPage() {
  const { setSidebarOpen } = useStudent();
  const [tab, setTab] = useState<Tab>("all");
  const [profile, setProfile] = useState(PROFILE_DEFAULT);
  const [profileForm, setProfileForm] = useState(PROFILE_DEFAULT);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [orgs, setOrgs] = useState<StudentOrg[]>(mockStudentOrgs);
  const [eskuls, setEskuls] = useState<Extracurricular[]>(mockExtracurriculars);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Achievement | StudentOrg | Extracurricular | null>(null);
  const [deleteItem, setDeleteItem] = useState<Achievement | StudentOrg | Extracurricular | null>(null);
  const [achForm, setAchForm] = useState({ title:"", category:"Akademik", level:"Kabupaten/Kota", position:"", organizer:"", date:"", description:"" });
  const [orgForm, setOrgForm] = useState({ orgName:"", role:"", since:"", description:"" });
  const [eskForm, setEskForm] = useState({ name:"", coach:"", role:"", since:"" });

  function openEdit(item: Achievement | StudentOrg | Extracurricular) {
    setEditItem(item);
    if (tab === "achievements") { const a = item as Achievement; setAchForm({ title:a.title, category:a.category, level:a.level, position:a.position, organizer:a.organizer, date:a.date, description:a.description??""  }); }
    if (tab === "orgs") { const o = item as StudentOrg; setOrgForm({ orgName:o.orgName, role:o.role, since:o.since, description:o.description??"" }); }
    if (tab === "eskul") { const e = item as Extracurricular; setEskForm({ name:e.name, coach:e.coach??"", role:e.role, since:e.since }); }
    setShowAdd(true);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (editItem) {
      if (tab === "achievements") {
        const updated: Achievement = { ...(editItem as Achievement), ...achForm, category: achForm.category as Achievement["category"], level: achForm.level as Achievement["level"] };
        setAchievements(p => p.map(a => a.id === editItem.id ? updated : a));
        toast.success("Prestasi diperbarui!");
      }
      if (tab === "orgs") {
        const updated: StudentOrg = { ...(editItem as StudentOrg), ...orgForm };
        setOrgs(p => p.map(o => o.id === editItem.id ? updated : o));
        toast.success("Organisasi diperbarui!");
      }
      if (tab === "eskul") {
        const updated: Extracurricular = { ...(editItem as Extracurricular), ...eskForm };
        setEskuls(p => p.map(ex => ex.id === editItem.id ? updated : ex));
        toast.success("Eskul diperbarui!");
      }
    } else {
      if (tab === "achievements") {
        const n: Achievement = { id: `ach${Date.now()}`, studentId: "s1", ...achForm, category: achForm.category as Achievement["category"], level: achForm.level as Achievement["level"], createdAt: new Date().toISOString() };
        setAchievements(p => [n, ...p]);
        toast.success("Prestasi ditambahkan!");
      }
      if (tab === "orgs") {
        const n: StudentOrg = { id: `so${Date.now()}`, studentId: "s1", ...orgForm, isActive: true, createdAt: new Date().toISOString() };
        setOrgs(p => [n, ...p]);
        toast.success("Organisasi ditambahkan!");
      }
      if (tab === "eskul") {
        const n: Extracurricular = { id: `ex${Date.now()}`, studentId: "s1", ...eskForm, isActive: true, createdAt: new Date().toISOString() };
        setEskuls(p => [n, ...p]);
        toast.success("Eskul ditambahkan!");
      }
    }
    setShowAdd(false);
    setEditItem(null);
  }

  function handleDelete() {
    if (!deleteItem) return;
    if (tab === "achievements") setAchievements(p => p.filter(a => a.id !== deleteItem.id));
    if (tab === "orgs") setOrgs(p => p.filter(o => o.id !== deleteItem.id));
    if (tab === "eskul") setEskuls(p => p.filter(ex => ex.id !== deleteItem.id));
    toast.success("Data dihapus."); setDeleteItem(null);
  }

  const filtAch = achievements.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  const filtOrg = orgs.filter(o => o.orgName.toLowerCase().includes(search.toLowerCase()));
  const filtEsk = eskuls.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfile(profileForm);
    setShowProfile(false);
    toast.success("Profil portofolio diperbarui!");
  }

  return (
    <>
      <Topbar title="Portofolio Digital" subtitle="Dokumentasi prestasi & organisasi Anda" role="student" setSidebarOpen={setSidebarOpen} />
      <main style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }} className="portfolio-main">

        {/* ── Profile Card ─────────────────────────────── */}
        <div className="card" style={{ padding:24, display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }} id="portfolio-profile">
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:72, height:72, background:"var(--primary)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:24 }}>
              {profile.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <button onClick={() => { setProfileForm(profile); setShowProfile(true); }} style={{ position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:"50%", background:"var(--primary)", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }} className="no-print">
              <Camera size={11} color="#fff" />
            </button>
          </div>
          <div style={{ flex:1, minWidth:180 }}>
            <h2 style={{ fontSize:20, fontWeight:800, color:"var(--text-primary)", marginBottom:4 }}>{profile.name}</h2>
            <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:8 }}>NIS: {profile.nis} &nbsp;•&nbsp; Kelas {profile.kelas}</p>
            <p style={{ fontSize:13, color:"var(--text-body)", lineHeight:1.6 }}>{profile.bio}</p>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0 }} className="no-print">
            <button onClick={() => { setProfileForm(profile); setShowProfile(true); }} className="btn btn-outline btn-sm" style={{ display:"flex", alignItems:"center", gap:5 }}>
              <Edit2 size={13} /> Edit Profil
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14 }}>
          {[
            { Icon:Trophy, label:"Total Prestasi", value:achievements.length, color:"var(--primary)" },
            { Icon:Users, label:"Organisasi Aktif", value:orgs.filter(o=>o.isActive).length, color:"var(--success)" },
            { Icon:BookOpen, label:"Eskul Aktif", value:eskuls.filter(e=>e.isActive).length, color:"var(--warning)" },
            { Icon:Award, label:"Sertifikat", value:achievements.filter(a=>a.certificateUrl).length, color:"var(--primary)" },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="card" style={{ padding:18, textAlign:"center" }}>
              <div style={{ width:40, height:40, background:`${color}18`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                <Icon size={18} color={color} />
              </div>
              <p style={{ fontSize:26, fontWeight:800, color:"var(--text-primary)", lineHeight:1, marginBottom:4 }}>{value}</p>
              <p style={{ fontSize:12, color:"var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>
          <div style={{ display:"flex", gap:4, background:"#f1f5f9", borderRadius:10, padding:3 }}>
            {(["all","achievements","orgs","eskul"] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setSearch(""); }} style={{
                padding:"7px 16px", borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer",
                background:tab===t?"#fff":"transparent", color:tab===t?"var(--primary)":"var(--text-muted)",
                border:tab===t?"1px solid var(--border)":"none",
              }}>
                {t==="all"?"✨ Semua":t==="achievements"?"🏆 Prestasi":t==="orgs"?"🏛️ Organisasi":"🎯 Eskul"}
              </button>
            ))}
          </div>
          <div style={{ position:"relative", flex:1, minWidth:180 }}>
            <Search size={14} color="var(--text-muted)" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
            <input className="form-input" style={{ paddingLeft:36, fontSize:13 }} placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => window.print()} className="btn btn-ghost btn-sm no-print" style={{ display:"flex", alignItems:"center", gap:5 }}><FileDown size={14} /> Export PDF</button>
          {tab !== "all" && (
            <button onClick={() => { setEditItem(null); setAchForm({ title:"", category:"Akademik", level:"Kabupaten/Kota", position:"", organizer:"", date:"", description:"" }); setOrgForm({ orgName:"", role:"", since:"", description:"" }); setEskForm({ name:"", coach:"", role:"", since:"" }); setShowAdd(true); }} className="btn btn-primary btn-sm no-print" style={{ display:"flex", alignItems:"center", gap:5 }}>
              <Plus size={14} /> {tab==="achievements"?"Tambah Prestasi":tab==="orgs"?"Tambah Organisasi":"Tambah Eskul"}
            </button>
          )}
        </div>

        {/* ── Tab: Semua ───────────────────────────────── */}
        {tab === "all" && (
          <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
            {/* Achievements section */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, background:"var(--primary-light)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><Trophy size={15} color="var(--primary)" /></div>
                <h3 style={{ fontSize:16, fontWeight:700 }}>Prestasi ({achievements.length})</h3>
              </div>
              {achievements.length === 0 ? (
                <div style={{ border:"2px dashed var(--border)", borderRadius:10, padding:28, textAlign:"center", color:"var(--text-muted)" }}>Belum ada prestasi</div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
                  {achievements.map(a => (
                    <div key={a.id} className="card" style={{ padding:16, borderLeft:"3px solid var(--primary)" }}>
                      <p style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>{a.title}</p>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:6 }}>
                        <span className={`badge ${CAT_COLOR[a.category]||"badge-gray"}`} style={{fontSize:11}}>{a.category}</span>
                        <span className="badge badge-gray" style={{fontSize:11}}>{a.level}</span>
                        <span className="badge badge-primary" style={{fontSize:11}}>{a.position}</span>
                      </div>
                      <p style={{ fontSize:11, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}><Calendar size={10}/>{a.date} • {a.organizer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Orgs section */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, background:"#dcfce7", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={15} color="var(--success)" /></div>
                <h3 style={{ fontSize:16, fontWeight:700 }}>Organisasi ({orgs.length})</h3>
              </div>
              {orgs.length === 0 ? (
                <div style={{ border:"2px dashed var(--border)", borderRadius:10, padding:28, textAlign:"center", color:"var(--text-muted)" }}>Belum ada organisasi</div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
                  {orgs.map(o => (
                    <div key={o.id} className="card" style={{ padding:16, borderLeft:"3px solid var(--success)" }}>
                      <p style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{o.orgName}</p>
                      <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6 }}>{o.role} • Sejak {o.since}</p>
                      {o.description && <p style={{ fontSize:12, color:"var(--text-body)", lineHeight:1.5 }}>{o.description}</p>}
                      <span className={`badge ${o.isActive?"badge-success":"badge-gray"}`} style={{fontSize:11,marginTop:8}}>{o.isActive?"Aktif":"Selesai"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Eskul section */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, background:"#fef3c7", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><BookOpen size={15} color="var(--warning)" /></div>
                <h3 style={{ fontSize:16, fontWeight:700 }}>Ekstrakurikuler ({eskuls.length})</h3>
              </div>
              {eskuls.length === 0 ? (
                <div style={{ border:"2px dashed var(--border)", borderRadius:10, padding:28, textAlign:"center", color:"var(--text-muted)" }}>Belum ada eskul</div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
                  {eskuls.map(ex => (
                    <div key={ex.id} className="card" style={{ padding:16, borderLeft:"3px solid var(--warning)" }}>
                      <p style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{ex.name}</p>
                      <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:4 }}>{ex.role}{ex.coach ? ` • Pelatih: ${ex.coach}`:""}</p>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                        <span style={{ fontSize:11, color:"var(--text-muted)" }}>Sejak {ex.since}</span>
                        <span className={`badge ${ex.isActive?"badge-warning":"badge-gray"}`} style={{fontSize:11}}>{ex.isActive?"Aktif":"Selesai"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements */}
        {tab === "achievements" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {filtAch.map(a => (
              <div key={a.id} className="card" style={{ padding:20, borderTop:"3px solid var(--primary)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ width:40, height:40, background:"var(--primary-light)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}><Trophy size={18} color="var(--primary)" /></div>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => openEdit(a)} className="btn btn-ghost btn-sm" style={{ padding:"5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteItem(a)} className="btn btn-ghost btn-sm" style={{ padding:"5px 8px", color:"var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <h4 style={{ fontSize:14, fontWeight:700, marginBottom:8, lineHeight:1.4 }}>{a.title}</h4>
                {a.description && <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:10, lineHeight:1.6 }}>{a.description}</p>}
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                  <span className={`badge ${CAT_COLOR[a.category]||"badge-gray"}`}>{a.category}</span>
                  <span className="badge badge-gray">{a.level}</span>
                  <span className="badge badge-primary">{a.position}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}><Calendar size={10} />{a.date}</span>
                  {a.certificateUrl
                    ? <span style={{ fontSize:11, color:"var(--success)", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><CheckCircle size={11} />Sertifikat ✓</span>
                    : <button className="btn btn-ghost btn-sm" style={{ fontSize:11, padding:"3px 8px", display:"flex", alignItems:"center", gap:4 }}><Upload size={11} />Upload</button>}
                </div>
              </div>
            ))}
            <div onClick={() => { setEditItem(null); setShowAdd(true); }} style={{ border:"2px dashed var(--border)", borderRadius:10, padding:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", minHeight:180, transition:"all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--primary)"; (e.currentTarget as HTMLElement).style.background="var(--primary-light)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--border)"; (e.currentTarget as HTMLElement).style.background="transparent"; }}>
              <div style={{ width:44, height:44, background:"var(--primary-light)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}><Plus size={22} color="var(--primary)" /></div>
              <p style={{ fontSize:13, fontWeight:600, color:"var(--primary)" }}>Tambah Prestasi Baru</p>
            </div>
          </div>
        )}

        {/* Organisations */}
        {tab === "orgs" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {filtOrg.map(o => (
              <div key={o.id} className="card" style={{ padding:24, borderTop:`3px solid ${o.isActive?"var(--primary)":"var(--text-muted)"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:46, height:46, background:"var(--primary-light)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={22} color="var(--primary)" /></div>
                    <div><h4 style={{ fontSize:15, fontWeight:700 }}>{o.orgName}</h4><p style={{ fontSize:12, color:"var(--text-muted)" }}>{o.role}</p></div>
                  </div>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => openEdit(o)} className="btn btn-ghost btn-sm" style={{ padding:"5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteItem(o)} className="btn btn-ghost btn-sm" style={{ padding:"5px 8px", color:"var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {o.description && <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:12, lineHeight:1.6 }}>{o.description}</p>}
                <div style={{ borderTop:"1px solid var(--border)", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:12, color:"var(--text-muted)" }}>Bergabung: <strong>{o.since}</strong></span>
                  <span className={`badge ${o.isActive?"badge-success":"badge-gray"}`}>{o.isActive?"Aktif":"Selesai"}</span>
                </div>
              </div>
            ))}
            <div onClick={() => { setEditItem(null); setShowAdd(true); }} style={{ border:"2px dashed var(--border)", borderRadius:12, padding:24, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", minHeight:160, transition:"all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--primary)"; (e.currentTarget as HTMLElement).style.background="var(--primary-light)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--border)"; (e.currentTarget as HTMLElement).style.background="transparent"; }}>
              <Plus size={24} color="var(--primary)" /><p style={{ fontSize:13, fontWeight:600, color:"var(--primary)" }}>Tambah Organisasi</p>
            </div>
          </div>
        )}

        {/* Eskul */}
        {tab === "eskul" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
            {filtEsk.map(ex => (
              <div key={ex.id} className="card" style={{ padding:22, borderLeft:`4px solid ${ex.isActive?"var(--warning)":"var(--text-muted)"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:40, height:40, background:"#fef3c7", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}><BookOpen size={18} color="var(--warning)" /></div>
                    <div><h4 style={{ fontSize:14, fontWeight:700 }}>{ex.name}</h4><p style={{ fontSize:12, color:"var(--text-muted)" }}>{ex.role}</p></div>
                  </div>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => openEdit(ex)} className="btn btn-ghost btn-sm" style={{ padding:"5px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteItem(ex)} className="btn btn-ghost btn-sm" style={{ padding:"5px 8px", color:"var(--danger)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {ex.coach && <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:8 }}>Pelatih: <strong>{ex.coach}</strong></p>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid var(--border)", paddingTop:10 }}>
                  <span style={{ fontSize:12, color:"var(--text-muted)" }}>Sejak {ex.since}</span>
                  <span className={`badge ${ex.isActive?"badge-warning":"badge-gray"}`}>{ex.isActive?"Aktif":"Selesai"}</span>
                </div>
              </div>
            ))}
            <div onClick={() => { setEditItem(null); setShowAdd(true); }} style={{ border:"2px dashed var(--border)", borderRadius:12, padding:24, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", minHeight:140, transition:"all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--primary)"; (e.currentTarget as HTMLElement).style.background="var(--primary-light)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--border)"; (e.currentTarget as HTMLElement).style.background="transparent"; }}>
              <Plus size={24} color="var(--primary)" /><p style={{ fontSize:13, fontWeight:600, color:"var(--primary)" }}>Tambah Eskul</p>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={ov} onClick={() => { setShowAdd(false); setEditItem(null); }}>
          <div style={md} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:18, fontWeight:700 }}>{editItem?"Edit":"Tambah"} {tab==="achievements"?"Prestasi":tab==="orgs"?"Organisasi":"Eskul"}</h3>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex" }} onClick={() => { setShowAdd(false); setEditItem(null); }}><X size={18} /></button>
            </div>
            {tab === "achievements" && (
              <form style={{ display:"flex", flexDirection:"column", gap:14 }} onSubmit={handleAdd}>
                <div><label className="form-label">Judul Prestasi *</label><input className="form-input" required value={achForm.title} onChange={e => setAchForm(f => ({ ...f, title:e.target.value }))} placeholder="Juara 1 Olimpiade Matematika" /></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label className="form-label">Kategori</label>
                    <select className="form-input" value={achForm.category} onChange={e => setAchForm(f => ({ ...f, category:e.target.value }))}>
                      {["Akademik","Non-Akademik","Organisasi","Olahraga","Seni"].map(c => <option key={c}>{c}</option>)}
                    </select></div>
                  <div><label className="form-label">Tingkat</label>
                    <select className="form-input" value={achForm.level} onChange={e => setAchForm(f => ({ ...f, level:e.target.value }))}>
                      {["Sekolah","Kabupaten/Kota","Provinsi","Nasional","Internasional"].map(l => <option key={l}>{l}</option>)}
                    </select></div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label className="form-label">Posisi *</label><input className="form-input" required value={achForm.position} onChange={e => setAchForm(f => ({ ...f, position:e.target.value }))} placeholder="Juara 1" /></div>
                  <div><label className="form-label">Tanggal *</label><input type="date" className="form-input" required value={achForm.date} onChange={e => setAchForm(f => ({ ...f, date:e.target.value }))} /></div>
                </div>
                <div><label className="form-label">Penyelenggara</label><input className="form-input" value={achForm.organizer} onChange={e => setAchForm(f => ({ ...f, organizer:e.target.value }))} placeholder="Dinas Pendidikan" /></div>
                <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={achForm.description} onChange={e => setAchForm(f => ({ ...f, description:e.target.value }))} style={{ resize:"vertical" }} /></div>
                <div style={{ border:"2px dashed var(--border)", borderRadius:8, padding:14, textAlign:"center", cursor:"pointer" }}>
                  <Upload size={18} color="var(--text-muted)" style={{ margin:"0 auto 4px" }} /><p style={{ fontSize:12, color:"var(--text-muted)" }}>Upload Sertifikat (PDF/JPG/PNG)</p>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => { setShowAdd(false); setEditItem(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}><Plus size={14} /> Simpan</button>
                </div>
              </form>
            )}
            {tab === "orgs" && (
              <form style={{ display:"flex", flexDirection:"column", gap:14 }} onSubmit={handleAdd}>
                <div><label className="form-label">Nama Organisasi *</label><input className="form-input" required value={orgForm.orgName} onChange={e => setOrgForm(f => ({ ...f, orgName:e.target.value }))} placeholder="OSIS, Paskibra..." /></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label className="form-label">Jabatan *</label><input className="form-input" required value={orgForm.role} onChange={e => setOrgForm(f => ({ ...f, role:e.target.value }))} placeholder="Anggota / Ketua" /></div>
                  <div><label className="form-label">Mulai Bergabung *</label><input type="date" className="form-input" required value={orgForm.since} onChange={e => setOrgForm(f => ({ ...f, since:e.target.value }))} /></div>
                </div>
                <div><label className="form-label">Deskripsi Peran</label><textarea className="form-input" rows={3} value={orgForm.description} onChange={e => setOrgForm(f => ({ ...f, description:e.target.value }))} style={{ resize:"vertical" }} /></div>
                <div style={{ display:"flex", gap:10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => { setShowAdd(false); setEditItem(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}><Plus size={14} /> Simpan</button>
                </div>
              </form>
            )}
            {tab === "eskul" && (
              <form style={{ display:"flex", flexDirection:"column", gap:14 }} onSubmit={handleAdd}>
                <div><label className="form-label">Nama Eskul *</label><input className="form-input" required value={eskForm.name} onChange={e => setEskForm(f => ({ ...f, name:e.target.value }))} placeholder="Futsal, Debate..." /></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label className="form-label">Peran</label><input className="form-input" value={eskForm.role} onChange={e => setEskForm(f => ({ ...f, role:e.target.value }))} placeholder="Anggota" /></div>
                  <div><label className="form-label">Pelatih</label><input className="form-input" value={eskForm.coach} onChange={e => setEskForm(f => ({ ...f, coach:e.target.value }))} placeholder="Nama pelatih" /></div>
                </div>
                <div><label className="form-label">Mulai Bergabung</label><input type="date" className="form-input" value={eskForm.since} onChange={e => setEskForm(f => ({ ...f, since:e.target.value }))} /></div>
                <div style={{ display:"flex", gap:10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => { setShowAdd(false); setEditItem(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}><Plus size={14} /> Simpan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteItem && (
        <div style={ov} onClick={() => setDeleteItem(null)}>
          <div style={{ ...md, maxWidth:400, textAlign:"center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:56, height:56, background:"var(--danger-light)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}><Trash2 size={24} color="var(--danger)" /></div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Hapus Data?</h3>
            <p style={{ fontSize:14, color:"var(--text-muted)", marginBottom:24 }}>Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setDeleteItem(null)}>Batal</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfile && (
        <div style={ov} onClick={() => setShowProfile(false)}>
          <div style={{ ...md, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:18, fontWeight:700 }}>Edit Profil Portofolio</h3>
              <button onClick={() => setShowProfile(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex" }}><X size={18} /></button>
            </div>
            <form onSubmit={saveProfile} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label className="form-label">Nama Lengkap *</label>
                <input className="form-input" required value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label className="form-label">NIS</label>
                  <input className="form-input" value={profileForm.nis} onChange={e => setProfileForm(f => ({ ...f, nis: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Kelas</label>
                  <input className="form-input" value={profileForm.kelas} onChange={e => setProfileForm(f => ({ ...f, kelas: e.target.value }))} placeholder="XI-IPA 2" />
                </div>
              </div>
              <div>
                <label className="form-label">Bio / Deskripsi Singkat</label>
                <textarea className="form-input" rows={3} value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} style={{ resize:"vertical" }} placeholder="Ceritakan sedikit tentang diri Anda..." />
                <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>Tampil di halaman portofolio dan hasil export PDF.</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={() => setShowProfile(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}>Simpan Profil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .no-print { }
        @media print {
          .no-print, .sidebar, nav, header, .topbar-menu-btn,
          [class*="Topbar"] { display: none !important; }
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          body { background: #fff !important; }
          .portfolio-main { padding: 16px !important; gap: 16px !important; }
          #portfolio-profile { border: 1px solid #e2e8f0 !important; break-inside: avoid; }
          .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          /* Force show all sections in print even if tab is not "all" */
          [data-print-section] { display: block !important; }
        }
      `}</style>
    </>
  );
}
