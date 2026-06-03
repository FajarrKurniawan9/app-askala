"use client";
import { useState, useEffect, useRef } from "react";
import Topbar from "@/components/layout/Topbar";
import { useStudent } from "@/lib/studentContext";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { studentService } from "@/services/student.service";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";
import {
  User, Mail, Phone, MapPin, Lock, Camera,
  Edit2, Save, X, Eye, EyeOff, Shield, BookOpen, Loader2,
} from "lucide-react";
import type { ApiStudent } from "@/lib/types";

export default function StudentProfilePage() {
  const { setSidebarOpen } = useStudent();
  const { user, updateUser, studentProfileId } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [studentData, setStudentData] = useState<ApiStudent | null>(null);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Avatar langsung dari store — persist otomatis
  const avatarUrl = user?.avatarUrl ?? null;

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "" });
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm]   = useState({ newPw: "", confirm: "" });
  const [showPw, setShowPw]   = useState({ newPw: false, confirm: false });

  // ── Load data from store + backend ──────────────────────────
  useEffect(() => {
    if (!studentProfileId) { setLoading(false); return; }
    studentService.getById(studentProfileId)
      .then(s => setStudentData(s))
      .catch(() => toast.error("Gagal memuat data akademik."))
      .finally(() => setLoading(false));
  }, [studentProfileId]);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName:  user.lastName  ?? "",
        email:     user.email     ?? "",
        phone:     user.phone     ?? "",
        address:   studentData?.address ?? "",
      });
    }
  }, [user, studentData]);

  // ── Avatar upload ───────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Maksimal 5MB."); return; }
    setUploadingAvatar(true);
    try {
      const { fileUrl } = await uploadService.uploadFile(file);
      await userService.update(user.id, { avatarUrl: fileUrl });
      // Fetch ulang dari backend → tidak bergantung pada response PATCH
      const fresh = await userService.getById(user.id);
      updateUser(fresh);
      toast.success("Foto profil diperbarui!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg.join(", ") : (msg ?? "Gagal mengunggah foto.");
      toast.error(errMsg);
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ── Save profile ─────────────────────────────────────────────
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await userService.update(user.id, {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim() || undefined,
      });
      // Fetch ulang agar avatarUrl tidak hilang dari response PATCH
      const fresh = await userService.getById(user.id);
      updateUser(fresh);
      // Update address via student profile if changed
      if (studentProfileId && form.address !== studentData?.address) {
        await studentService.update(studentProfileId, { address: form.address.trim() || undefined });
        setStudentData(prev => prev ? { ...prev, address: form.address.trim() } : prev);
      }
      setEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Gagal menyimpan profil."));
    } finally {
      setSaving(false);
    }
  }

  // ── Change password ──────────────────────────────────────────
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Konfirmasi password tidak cocok!"); return; }
    if (pwForm.newPw.length < 8)         { toast.error("Password minimal 8 karakter!"); return; }
    if (!user) return;
    setSaving(true);
    try {
      await userService.update(user.id, { password: pwForm.newPw });
      setPwModal(false);
      setPwForm({ newPw: "", confirm: "" });
      toast.success("Password berhasil diubah!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Gagal mengubah password."));
    } finally {
      setSaving(false);
    }
  }

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Siswa";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <Icon size={16} color="var(--primary)" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 3 }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{value || "—"}</p>
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
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 96, height: 96, background: "var(--primary)", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 32 }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" key={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials
                }
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {uploadingAvatar
                  ? <Loader2 size={13} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                  : <Camera size={13} color="#fff" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{displayName}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                {loading ? "Memuat..." : studentData
                  ? `${studentData.classRoom} • NIS: ${studentData.nis}`
                  : user?.email}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {studentData?.major && <span className="badge badge-primary"><BookOpen size={10} />{studentData.major}</span>}
                <span className="badge badge-success">Siswa Aktif</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {!editing ? (
                <>
                  <button onClick={() => setPwModal(true)} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Lock size={13} /> Ganti Password
                  </button>
                  <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Edit2 size={13} /> Edit Profil
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <X size={13} /> Batal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info / Edit */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Shield size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Pribadi</h3>
          </div>

          {!editing ? (
            <div>
              <InfoRow icon={User}   label="Nama Lengkap" value={displayName} />
              <InfoRow icon={Mail}   label="Email"        value={user?.email ?? ""} />
              <InfoRow icon={Phone}  label="No. HP"       value={user?.phone ?? ""} />
              <InfoRow icon={MapPin} label="Alamat"       value={studentData?.address ?? ""} />
            </div>
          ) : (
            <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="form-label">Nama Depan *</label>
                  <input className="form-input" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Nama Belakang *</label>
                  <input className="form-input" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">No. HP</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Opsional" />
                </div>
              </div>
              <div>
                <label className="form-label">Alamat</label>
                <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Opsional" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setEditing(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }} disabled={saving}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Academic Info — read only dari backend */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <BookOpen size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Akademik</h3>
          </div>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13 }}>Memuat data akademik...</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                { label: "NIS",           value: studentData?.nis       ?? "—" },
                { label: "Kelas",         value: studentData?.classRoom ?? "—" },
                { label: "Jurusan",       value: studentData?.major     ?? "—" },
                { label: "Tingkat",       value: studentData?.grade     ?? "—" },
                { label: "Email",         value: user?.email            ?? "—" },
                { label: "Status",        value: "Siswa Aktif" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          )}
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
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Minimal 8 karakter</p>
              </div>
              <button onClick={() => setPwModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                ["newPw",   "Password Baru"],
                ["confirm", "Konfirmasi Password Baru"],
              ] as [keyof typeof pwForm, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="form-label">{label} *</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPw[key] ? "text" : "password"} className="form-input" required style={{ paddingRight: 44 }}
                      value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setPwModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }} disabled={saving}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Lock size={14} />}
                  {saving ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
