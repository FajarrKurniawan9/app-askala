"use client";
import { useState, useEffect, useRef } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  User, School, Bell, Lock, Save, Eye, EyeOff,
  Camera, CheckCircle, Shield, Mail, Phone, MapPin,
  Globe, BookOpen, Loader2, X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { uploadService } from "@/services/upload.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import type { NotificationSettings, SchoolInfo } from "@/lib/types";

type Tab = "profile" | "school" | "notifications" | "security";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profil Admin",  icon: <User size={15} /> },
  { id: "school",        label: "Info Sekolah",  icon: <School size={15} /> },
  { id: "notifications", label: "Notifikasi",    icon: <Bell size={15} /> },
  { id: "security",      label: "Keamanan",      icon: <Lock size={15} /> },
];

const DEFAULT_SCHOOL: SchoolInfo = {
  name: "", address: "", phone: "", email: "",
  website: "", tahunAjaran: "2025/2026",
  kepalaSekolah: "", npsn: "",
};

const DEFAULT_NOTIF: NotificationSettings = {
  emailVerifikasi: true, emailPembayaran: true,
  emailKegiatan: false, pushNotif: true, weeklyReport: false,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
      background: checked ? "var(--primary)" : "#cbd5e1",
      position: "relative", transition: "background .2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 2,
        left: checked ? "calc(100% - 22px)" : 2,
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s",
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Profile state (seeded dari auth store) ──────────────────
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    email:     user?.email     ?? "",
    phone:     user?.phone     ?? "",
  });
  const [avatarUrl, setAvatarUrl]         = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── School & notif (local only — no backend endpoint) ───────
  const [school, setSchool] = useState<SchoolInfo>({ ...DEFAULT_SCHOOL });
  const [notif,  setNotif]  = useState<NotificationSettings>({ ...DEFAULT_NOTIF });

  // ── Security ─────────────────────────────────────────────────
  const [pwForm, setPwForm]   = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw]   = useState({ current: false, newPw: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  // Sync profile form whenever auth store rehydrates
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName ?? "",
        lastName:  user.lastName  ?? "",
        email:     user.email     ?? "",
        phone:     user.phone     ?? "",
      });
      // Sync avatar dari store kalau belum ada preview baru
      if (user.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user]);

  // ── Handle avatar file pick ─────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB."); return; }
    // Preview
    setAvatarPreview(URL.createObjectURL(file));
    // Upload
    setUploadingAvatar(true);
    try {
      const { fileUrl } = await uploadService.uploadFile(file);
      setAvatarUrl(fileUrl);
      toast.success("Foto berhasil diunggah! Klik 'Simpan Profil' untuk menyimpan.");
    } catch {
      toast.error("Gagal mengunggah foto.");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  }

  // ── Save profile ─────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const updated = await userService.update(user.id, {
        firstName: profileForm.firstName.trim(),
        lastName:  profileForm.lastName.trim(),
        email:     profileForm.email.trim(),
        phone:     profileForm.phone.trim() || undefined,
        avatarUrl: avatarUrl ?? undefined,
      });
      updateUser({ ...updated, avatarUrl: avatarUrl ?? updated.avatarUrl });
      toast.success("Profil berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan profil. Coba lagi.");
    } finally {
      setSavingProfile(false);
    }
  }

  // ── Change password ──────────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Konfirmasi password tidak cocok."); return; }
    if (pwForm.newPw.length < 8)         { toast.error("Password minimal 8 karakter."); return; }
    if (!user) return;
    setSavingPw(true);
    try {
      await userService.update(user.id, { password: pwForm.newPw });
      setPwForm({ current: "", newPw: "", confirm: "" });
      toast.success("Password berhasil diubah!");
    } catch {
      toast.error("Gagal mengubah password. Coba lagi.");
    } finally {
      setSavingPw(false);
    }
  }

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "Admin";

  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <Topbar title="Pengaturan" subtitle="Konfigurasi akun dan sistem" role="admin" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Tab Nav */}
        <div className="card" style={{ padding: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13,
              background: tab === t.id ? "var(--primary)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--text-muted)",
              transition: "background .15s, color .15s",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ──────────────────────────────────── */}
        {tab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "flex-start" }} className="settings-grid">

            {/* Avatar Card */}
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                {/* Avatar image or initials */}
                {(avatarPreview ?? avatarUrl) ? (
                  <img
                    src={avatarPreview ?? avatarUrl!}
                    alt="Avatar"
                    style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto" }}
                  />
                ) : (
                  <div style={{ width: 84, height: 84, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 28, margin: "0 auto" }}>
                    {initials}
                  </div>
                )}
                {/* Upload button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "var(--primary)", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  title="Ganti foto"
                >
                  {uploadingAvatar
                    ? <Loader2 size={12} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                    : <Camera size={13} color="#fff" />
                  }
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarChange} />
              </div>

              <p style={{ fontWeight: 700, fontSize: 15 }}>{displayName}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{user?.email}</p>
              <span className="badge badge-danger">Admin</span>

              {avatarPreview && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>
                    Foto baru dipilih. Klik "Simpan Profil" untuk menyimpan.
                  </p>
                </div>
              )}

              <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 2 }}>Role</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user?.role ?? "ADMIN"}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Informasi Profil</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Data diambil dari akun yang sedang login</p>

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">Nama Depan</label>
                    <div style={{ position: "relative" }}>
                      <User size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input className="form-input" value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} style={{ paddingLeft: 36 }} required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Nama Belakang</label>
                    <input className="form-input" value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">Email</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input type="email" className="form-input" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} style={{ paddingLeft: 36 }} required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">No. HP</label>
                    <div style={{ position: "relative" }}>
                      <Phone size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} style={{ paddingLeft: 36 }} placeholder="Opsional" />
                    </div>
                  </div>
                </div>
                <div>
                  <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {savingProfile ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                    {savingProfile ? "Menyimpan..." : "Simpan Profil"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── School Tab ───────────────────────────────────── */}
        {tab === "school" && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, background: "var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Sekolah</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Data resmi institusi yang digunakan di seluruh sistem</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Nama Sekolah</label>
                <input className="form-input" value={school.name} onChange={e => setSchool(s => ({ ...s, name: e.target.value }))} placeholder="SMA Negeri 1 ..." />
              </div>
              <div>
                <label className="form-label">NPSN</label>
                <input className="form-input" value={school.npsn} onChange={e => setSchool(s => ({ ...s, npsn: e.target.value }))} style={{ fontFamily: "monospace" }} />
              </div>
              <div>
                <label className="form-label">Tahun Ajaran</label>
                <input className="form-input" value={school.tahunAjaran} onChange={e => setSchool(s => ({ ...s, tahunAjaran: e.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Kepala Sekolah</label>
                <input className="form-input" value={school.kepalaSekolah} onChange={e => setSchool(s => ({ ...s, kepalaSekolah: e.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Alamat</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: 13, pointerEvents: "none" }} />
                  <textarea className="form-input" value={school.address} onChange={e => setSchool(s => ({ ...s, address: e.target.value }))} rows={2} style={{ paddingLeft: 36, resize: "vertical" }} />
                </div>
              </div>
              <div>
                <label className="form-label">Telepon</label>
                <div style={{ position: "relative" }}>
                  <Phone size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="form-input" value={school.phone} onChange={e => setSchool(s => ({ ...s, phone: e.target.value }))} style={{ paddingLeft: 36 }} />
                </div>
              </div>
              <div>
                <label className="form-label">Email Sekolah</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="email" className="form-input" value={school.email} onChange={e => setSchool(s => ({ ...s, email: e.target.value }))} style={{ paddingLeft: 36 }} />
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Website</label>
                <div style={{ position: "relative" }}>
                  <Globe size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="form-input" value={school.website ?? ""} onChange={e => setSchool(s => ({ ...s, website: e.target.value }))} style={{ paddingLeft: 36 }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => toast.success("Informasi sekolah disimpan!")}>
                <Save size={14} /> Simpan Info Sekolah
              </button>
            </div>
          </div>
        )}

        {/* ── Notifications Tab ────────────────────────────── */}
        {tab === "notifications" && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pengaturan Notifikasi</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>Atur notifikasi yang ingin Anda terima</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {([
                { key: "emailVerifikasi", label: "Email – Verifikasi Pembayaran",  sub: "Notifikasi ketika ada pembayaran siswa yang menunggu diverifikasi" },
                { key: "emailPembayaran", label: "Email – Pembayaran Baru",        sub: "Notifikasi setiap ada pembayaran baru yang masuk ke sistem" },
                { key: "emailKegiatan",   label: "Email – Update Kegiatan",        sub: "Informasi perubahan status kegiatan organisasi" },
                { key: "pushNotif",       label: "Push Notification",              sub: "Notifikasi langsung di browser untuk aktivitas penting" },
                { key: "weeklyReport",    label: "Laporan Mingguan",               sub: "Ringkasan aktivitas dikirim setiap Senin pagi" },
              ] as { key: keyof NotificationSettings; label: string; sub: string }[]).map((item, i, arr) => (
                <div key={item.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                  padding: "16px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.sub}</p>
                  </div>
                  <Toggle checked={notif[item.key]} onChange={v => setNotif(n => ({ ...n, [item.key]: v }))} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => toast.success("Pengaturan notifikasi disimpan!")}>
                <Save size={14} /> Simpan Pengaturan
              </button>
            </div>
          </div>
        )}

        {/* ── Security Tab ─────────────────────────────────── */}
        {tab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={18} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Ganti Password</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Gunakan password yang kuat dan unik</p>
                </div>
              </div>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 460 }}>
                {([
                  { key: "current", label: "Password Saat Ini" },
                  { key: "newPw",   label: "Password Baru" },
                  { key: "confirm", label: "Konfirmasi Password Baru" },
                ] as { key: keyof typeof showPw; label: string }[]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPw[key] ? "text" : "password"} className="form-input" style={{ paddingRight: 44 }}
                        value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 4 }}>
                  <button type="submit" disabled={savingPw} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {savingPw ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Lock size={14} />}
                    {savingPw ? "Menyimpan..." : "Perbarui Password"}
                  </button>
                </div>
              </form>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Shield size={18} color="var(--primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Informasi Akun</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Email",       user?.email  ?? "—"],
                  ["Role",        user?.role   ?? "—"],
                  ["User ID",     String(user?.id ?? "—")],
                  ["Dibuat",      user?.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{lbl}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
