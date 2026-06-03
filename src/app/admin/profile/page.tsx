"use client";
import { useState, useRef, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { useAdmin } from "@/lib/adminContext";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";
import {
  Camera, Mail, Phone, Shield, Edit2, Save, X,
  Lock, Eye, EyeOff, Loader2, CheckCircle,
  Calendar, User, Key, ImageIcon,
} from "lucide-react";
import Link from "next/link";

export default function AdminProfilePage() {
  const { setSidebarOpen } = useAdmin();
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing]   = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    email:     user?.email     ?? "",
    phone:     user?.phone     ?? "",
  });

  const [pwForm, setPwForm] = useState({ newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ newPw: false, confirm: false });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName:  user.lastName  ?? "",
        email:     user.email     ?? "",
        phone:     user.phone     ?? "",
      });
      if (user.avatarUrl) setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "Admin";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB."); return; }
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const { fileUrl } = await uploadService.uploadFile(file);
      setPendingAvatarUrl(fileUrl);
      // Langsung simpan ke database
      if (user) {
        const updated = await userService.update(user.id, { avatarUrl: fileUrl });
        updateUser({ ...updated, avatarUrl: fileUrl });
        setAvatarPreview(fileUrl);
      }
      toast.success("Foto profil berhasil diperbarui!");
    } catch {
      toast.error("Gagal mengunggah foto.");
      setAvatarPreview(user?.avatarUrl ?? null);
    } finally {
      setUploadingAvatar(false);
      setPendingAvatarUrl(null);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const updated = await userService.update(user.id, {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim() || undefined,
      });
      updateUser(updated);
      setEditing(false);
      toast.success("Profil berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Konfirmasi password tidak cocok."); return; }
    if (pwForm.newPw.length < 8) { toast.error("Password minimal 8 karakter."); return; }
    if (!user) return;
    setSavingPw(true);
    try {
      await userService.update(user.id, { password: pwForm.newPw });
      setShowPwModal(false);
      setPwForm({ newPw: "", confirm: "" });
      toast.success("Password berhasil diubah!");
    } catch {
      toast.error("Gagal mengubah password.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <>
      <Topbar title="Profil Saya" subtitle="Kelola data akun administrator" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, maxWidth: 900, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Hero Card ──────────────────────────────────────── */}
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Banner gradient */}
          <div style={{
            height: 120,
            background: "linear-gradient(135deg, var(--primary) 0%, #02635c 50%, #014d47 100%)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0, opacity: .15,
              backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }} />
          </div>

          {/* Avatar + info row */}
          <div style={{ padding: "0 28px 28px", position: "relative" }}>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ position: "relative", marginTop: -48 }}>
                <div style={{
                  width: 96, height: 96, borderRadius: "50%",
                  border: "4px solid #fff",
                  background: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,.15)",
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 32 }}>{initials}</span>
                  )}
                </div>
                {/* Camera button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Ganti foto"
                  style={{
                    position: "absolute", bottom: 2, right: 2,
                    width: 30, height: 30, borderRadius: "50%",
                    background: "var(--primary)", border: "2px solid #fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.2)",
                  }}
                >
                  {uploadingAvatar
                    ? <Loader2 size={13} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                    : <Camera size={13} color="#fff" />
                  }
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarChange} />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
                {!editing ? (
                  <>
                    <button onClick={() => setShowPwModal(true)} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Key size={13} /> Ganti Password
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

            {/* Name + badges */}
            <div style={{ marginTop: 14 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{displayName}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{user?.email}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-danger"><Shield size={11} /> Admin</span>
                <span className="badge badge-success"><CheckCircle size={11} /> Aktif</span>
                <span className="badge badge-gray"><Calendar size={11} /> Bergabung {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "flex-start" }} className="profile-grid">

          {/* Left — Info / Edit Form */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 38, height: 38, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={18} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Pribadi</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Data akun yang terdaftar di sistem</p>
              </div>
            </div>

            {!editing ? (
              /* ── Read mode ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { icon: User,  label: "Nama Depan",   value: user?.firstName || "—" },
                  { icon: User,  label: "Nama Belakang", value: user?.lastName  || "—" },
                  { icon: Mail,  label: "Email",         value: user?.email     || "—" },
                  { icon: Phone, label: "No. HP",        value: user?.phone     || "Belum diisi" },
                ].map(({ icon: Icon, label, value }, i, arr) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} color="var(--primary)" />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{value}</p>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 20 }}>
                  <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Edit2 size={13} /> Edit Informasi
                  </button>
                </div>
              </div>
            ) : (
              /* ── Edit mode ── */
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">Nama Depan *</label>
                    <div style={{ position: "relative" }}>
                      <User size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} style={{ paddingLeft: 36 }} required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Nama Belakang *</label>
                    <input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: 36 }} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">No. HP</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ paddingLeft: 36 }} placeholder="Opsional" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {savingProfile ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                    {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Batal</button>
                </div>
              </form>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Account stats */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>Ringkasan Akun</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Role",      value: user?.role ?? "ADMIN",  color: "var(--danger)" },
                  { label: "Status",    value: "Aktif",                color: "var(--success)" },
                  { label: "User ID",   value: `#${user?.id ?? "—"}`,  color: "var(--primary)" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 4 }}>Bergabung Sejak</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{joinDate}</p>
                </div>
              </div>
            </div>

            {/* Photo card */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Foto Profil</h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>JPG, PNG, WebP · Maks. 5MB</p>
              <div style={{
                width: "100%", aspectRatio: "1", maxWidth: 120,
                margin: "0 auto 16px",
                borderRadius: "50%", overflow: "hidden",
                background: "var(--primary-light)",
                border: "3px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <ImageIcon size={32} color="var(--text-muted)" />
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="btn btn-outline btn-sm"
                style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}
              >
                {uploadingAvatar
                  ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Mengunggah...</>
                  : <><Camera size={13} /> Ganti Foto</>
                }
              </button>
            </div>

            {/* Quick links */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "var(--text-primary)" }}>Tautan Cepat</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Link href="/admin/settings" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "var(--text-body)", fontSize: 13, fontWeight: 500, transition: "background .12s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-light)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <Shield size={15} color="var(--primary)" /> Pengaturan Akun
                </Link>
                <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "var(--text-body)", fontSize: 13, fontWeight: 500, transition: "background .12s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-light)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <CheckCircle size={15} color="var(--primary)" /> Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Change Password Modal ─────────────────────────── */}
      {showPwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setShowPwModal(false)}>
          <div className="card" style={{ width: "100%", maxWidth: 440, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Ganti Password</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Minimal 8 karakter</p>
              </div>
              <button onClick={() => setShowPwModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                { key: "newPw",   label: "Password Baru" },
                { key: "confirm", label: "Konfirmasi Password" },
              ] as { key: keyof typeof pwForm; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label className="form-label">{label} *</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input type={showPw[key] ? "text" : "password"} className="form-input" style={{ paddingLeft: 36, paddingRight: 44 }}
                      value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowPwModal(false)}>Batal</button>
                <button type="submit" disabled={savingPw} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }}>
                  {savingPw ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Key size={14} />}
                  {savingPw ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) { .profile-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
