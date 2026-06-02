"use client";
import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { toast } from "sonner";
import {
  User, Mail, Phone, MapPin, Lock, Camera,
  Edit2, Save, X, Eye, EyeOff, Shield, BookOpen,
} from "lucide-react";

const INITIAL_PROFILE = {
  name: "Ahmad Rizky Pratama",
  email: "ahmad.rizky@student.sch.id",
  phone: "081234567890",
  address: "Jl. Soekarno-Hatta No. 12, Malang",
  nis: "2024001001",
  kelas: "XI-IPA 2",
  jurusan: "IPA",
  school: "SMA Negeri 3 Malang",
  joinDate: "14 Juli 2023",
};

export default function StudentProfilePage() {
  const { setSidebarOpen } = useStudent();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(INITIAL_PROFILE);
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);

  function startEdit() { setForm(profile); setEditing(true); }
  function cancelEdit() { setEditing(false); }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: await profileService.update(form)
    await new Promise(r => setTimeout(r, 600));
    setProfile(form);
    setEditing(false);
    setSaving(false);
    toast.success("Profil berhasil diperbarui!");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Password baru tidak cocok!");
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setPwModal(false);
    setPwForm({ current: "", newPw: "", confirm: "" });
    toast.success("Password berhasil diubah!");
  }

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <Icon size={16} color="var(--primary)" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 3 }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <Topbar title="Profil Saya" subtitle="Kelola data diri dan akun Anda" role="student" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto" }}>

        {/* Avatar Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 96, height: 96, background: "var(--primary)",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 32,
              }}>
                {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <button style={{
                position: "absolute", bottom: 0, right: 0,
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--primary)", border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>
                <Camera size={13} color="#fff" />
              </button>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{profile.name}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                {profile.kelas} &nbsp;•&nbsp; NIS: {profile.nis} &nbsp;•&nbsp; {profile.school}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-primary"><BookOpen size={10} />{profile.jurusan}</span>
                <span className="badge badge-success">Siswa Aktif</span>
                <span className="badge badge-gray">Bergabung {profile.joinDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {!editing ? (
                <>
                  <button onClick={() => setPwModal(true)} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Lock size={13} /> Ganti Password
                  </button>
                  <button onClick={startEdit} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Edit2 size={13} /> Edit Profil
                  </button>
                </>
              ) : (
                <button onClick={cancelEdit} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <X size={13} /> Batal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info / Edit Form */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Shield size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Pribadi</h3>
          </div>

          {!editing ? (
            <div>
              <InfoRow icon={User} label="Nama Lengkap" value={profile.name} />
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="No. HP" value={profile.phone} />
              <InfoRow icon={MapPin} label="Alamat" value={profile.address} />
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
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="form-label">No. HP</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Alamat</label>
                  <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={cancelEdit}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>
                  <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Academic Info (read-only) */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <BookOpen size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Akademik</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {[
              { label: "NIS", value: profile.nis },
              { label: "Kelas", value: profile.kelas },
              { label: "Jurusan", value: profile.jurusan },
              { label: "Sekolah", value: profile.school },
              { label: "Tanggal Masuk", value: profile.joinDate },
              { label: "Status", value: "Siswa Aktif" },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14, fontStyle: "italic" }}>
            * Data akademik hanya dapat diubah oleh Admin sekolah.
          </p>
        </div>
      </main>

      {/* Change Password Modal */}
      {pwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setPwModal(false)}>
          <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Ganti Password</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Masukkan password lama dan password baru Anda</p>
              </div>
              <button onClick={() => setPwModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                ["current", "Password Saat Ini"],
                ["newPw", "Password Baru"],
                ["confirm", "Konfirmasi Password Baru"],
              ] as [keyof typeof pwForm, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="form-label">{label} *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw[key] ? "text" : "password"}
                      className="form-input"
                      required
                      style={{ paddingRight: 44 }}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <button type="button"
                      onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--primary-light)", borderRadius: 8, padding: "10px 14px" }}>
                Password minimal 8 karakter dan sebaiknya mengandung huruf besar, angka, dan simbol.
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setPwModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>
                  <Lock size={14} /> {saving ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
