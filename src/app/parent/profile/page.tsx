"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { toast } from "sonner";
import {
  User, Mail, Phone, MapPin, Lock, Save, X, Eye, EyeOff,
  GraduationCap, BookOpen, Camera,
} from "lucide-react";

const INITIAL = {
  name: "Ibu Kartini Dewi",
  email: "kartini.dewi@gmail.com",
  phone: "08112345678",
  address: "Jl. Pahlawan No. 5, Malang",
  pekerjaan: "Guru SMP",
  hubungan: "Ibu Kandung",
};

const CHILD = {
  name: "Ahmad Rizky Pratama",
  nis: "2024001001",
  kelas: "XI-IPA 2",
  school: "SMA Negeri 3 Malang",
};

export default function ParentProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(INITIAL);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);

  function startEdit() { setForm(profile); setEditing(true); }
  function cancelEdit() { setEditing(false); }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setProfile(form);
    setEditing(false);
    setSaving(false);
    toast.success("Profil berhasil diperbarui!");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Password baru tidak cocok!"); return; }
    if (pwForm.newPw.length < 8) { toast.error("Password minimal 8 karakter!"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setPwModal(false);
    setPwForm({ current: "", newPw: "", confirm: "" });
    toast.success("Password berhasil diubah!");
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="parent" userName={profile.name} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ flex: 1 }}>
        <Topbar title="Profil Orang Tua" subtitle="Kelola data diri dan akun Anda" role="parent" setSidebarOpen={setSidebarOpen} />

        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 780 }}>

          {/* Avatar Card */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 88, height: 88, background: "var(--warning)", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 28,
                }}>
                  {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <button style={{
                  position: "absolute", bottom: 0, right: 0, width: 28, height: 28,
                  borderRadius: "50%", background: "var(--primary)", border: "2px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  <Camera size={12} color="#fff" />
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{profile.name}</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{profile.hubungan} &nbsp;•&nbsp; {profile.pekerjaan}</p>
                <span className="badge badge-warning">Orang Tua / Wali</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!editing ? (
                  <>
                    <button onClick={() => setPwModal(true)} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Lock size={13} /> Ganti Password
                    </button>
                    <button onClick={startEdit} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Save size={13} /> Edit Profil
                    </button>
                  </>
                ) : (
                  <button onClick={cancelEdit} className="btn btn-ghost btn-sm"><X size={13} /> Batal</button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form / Info */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <User size={16} color="var(--primary)" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Pribadi</h3>
            </div>
            {!editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  [Mail, "Email", profile.email],
                  [Phone, "No. HP", profile.phone],
                  [MapPin, "Alamat", profile.address],
                  [GraduationCap, "Pekerjaan", profile.pekerjaan],
                  [User, "Hubungan", profile.hubungan],
                ].map(([Icon, label, value]) => (
                  <div key={String(label)}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 3 }}>{String(label)}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">Nama Lengkap *</label>
                    <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">No. HP</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Pekerjaan</label>
                    <input className="form-input" value={form.pekerjaan} onChange={e => setForm(f => ({ ...f, pekerjaan: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Alamat</label>
                  <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={cancelEdit}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>
                    <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Linked Student Card */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <BookOpen size={16} color="var(--primary)" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Data Anak Terkait</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "var(--primary-light)", borderRadius: 10, border: "1px solid rgba(2,126,116,.15)" }}>
              <div style={{ width: 48, height: 48, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
                AR
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{CHILD.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>NIS: {CHILD.nis} &nbsp;•&nbsp; {CHILD.kelas} &nbsp;•&nbsp; {CHILD.school}</p>
              </div>
              <span className="badge badge-success">Siswa Aktif</span>
            </div>
          </div>

        </main>
      </div>

      {/* Change Password Modal */}
      {pwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setPwModal(false)}>
          <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Ganti Password</h3>
              <button onClick={() => setPwModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([["current", "Password Saat Ini"], ["newPw", "Password Baru"], ["confirm", "Konfirmasi Password"]] as [keyof typeof pwForm, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="form-label">{label} *</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPw[key] ? "text" : "password"} className="form-input" required style={{ paddingRight: 44 }}
                      value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setPwModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>
                  <Lock size={14} /> {saving ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
