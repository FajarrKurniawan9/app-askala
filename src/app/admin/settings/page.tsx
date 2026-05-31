"use client";
import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import {
  User, School, Bell, Lock, Save, Eye, EyeOff,
  Camera, CheckCircle, Shield, Mail, Phone, MapPin,
  Globe, BookOpen,
} from "lucide-react";
import { mockAdminProfile, mockSchoolInfo, mockNotifSettings } from "@/lib/mockData";

type Tab = "profile" | "school" | "notifications" | "security";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",        label: "Profil Admin",   icon: <User size={15} /> },
  { id: "school",         label: "Info Sekolah",   icon: <School size={15} /> },
  { id: "notifications",  label: "Notifikasi",     icon: <Bell size={15} /> },
  { id: "security",       label: "Keamanan",       icon: <Lock size={15} /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
        background: checked ? "var(--primary)" : "#cbd5e1",
        position: "relative", transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: checked ? "calc(100% - 22px)" : 2,
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s",
      }} />
    </button>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="toast toast-success" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 10 }}>
      <CheckCircle size={16} />
      <span>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: 8 }}>✕</button>
    </div>
  );
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const [toast, setToast] = useState("");

  // Profile form
  const [profile, setProfile] = useState({ ...mockAdminProfile });

  // School form
  const [school, setSchool] = useState({ ...mockSchoolInfo });

  // Notif settings
  const [notif, setNotif] = useState({ ...mockNotifSettings });

  // Security form
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  function save(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <>
      <Topbar title="Pengaturan" subtitle="Konfigurasi akun dan sistem" role="admin" userName="Budi Santoso" setSidebarOpen={setSidebarOpen} />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Tab Navigation ─────────────────────────────────── */}
        <div className="card" style={{ padding: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
              background: tab === t.id ? "var(--primary)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--text-muted)",
              transition: "background .15s, color .15s",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ────────────────────────────────────── */}
        {tab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "flex-start" }} className="settings-grid">
            {/* Avatar Card */}
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                <div style={{ width: 84, height: 84, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 28, margin: "0 auto" }}>
                  {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <button style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "var(--primary)", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Camera size={13} color="#fff" />
                </button>
              </div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{profile.name}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{profile.jabatan}</p>
              <span className="badge badge-danger">Admin</span>
              <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>NIP</p>
                <p style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-body)" }}>{profile.nip}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Informasi Profil</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Perbarui data akun administrator sekolah</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">Nama Lengkap</label>
                    <div style={{ position: "relative" }}>
                      <User size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={{ paddingLeft: 36 }} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Jabatan</label>
                    <input className="form-input" value={profile.jabatan} onChange={e => setProfile(p => ({ ...p, jabatan: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="form-label">Email</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input type="email" className="form-input" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} style={{ paddingLeft: 36 }} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">No. HP</label>
                    <div style={{ position: "relative" }}>
                      <Phone size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input className="form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={{ paddingLeft: 36 }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="form-label">NIP</label>
                  <input className="form-input" value={profile.nip} onChange={e => setProfile(p => ({ ...p, nip: e.target.value }))} style={{ fontFamily: "monospace" }} />
                </div>
                <div style={{ marginTop: 4 }}>
                  <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => save("Profil berhasil disimpan!")}>
                    <Save size={14} /> Simpan Profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── School Tab ─────────────────────────────────────── */}
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
                <input className="form-input" value={school.name} onChange={e => setSchool(s => ({ ...s, name: e.target.value }))} />
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
              <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => save("Informasi sekolah berhasil disimpan!")}>
                <Save size={14} /> Simpan Info Sekolah
              </button>
            </div>
          </div>
        )}

        {/* ── Notifications Tab ──────────────────────────────── */}
        {tab === "notifications" && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pengaturan Notifikasi</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>Atur notifikasi yang Anda ingin terima dari sistem</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {([
                { key: "emailVerifikasi", label: "Email – Verifikasi Pembayaran",   sub: "Notifikasi ketika ada pembayaran siswa yang menunggu diverifikasi" },
                { key: "emailPembayaran", label: "Email – Pembayaran Baru",          sub: "Notifikasi setiap ada pembayaran baru yang masuk ke sistem" },
                { key: "emailKegiatan",   label: "Email – Update Kegiatan",          sub: "Informasi perubahan status dan update kegiatan organisasi" },
                { key: "pushNotif",       label: "Push Notification",                sub: "Notifikasi langsung di browser untuk aktivitas penting" },
                { key: "weeklyReport",    label: "Laporan Mingguan",                 sub: "Ringkasan aktivitas dan statistik dikirim setiap Senin pagi" },
              ] as { key: keyof typeof notif; label: string; sub: string }[]).map((item, i, arr) => (
                <div key={item.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                  padding: "16px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.sub}</p>
                  </div>
                  <Toggle checked={notif[item.key]} onChange={v => setNotif(n => ({ ...n, [item.key]: v }))} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => save("Pengaturan notifikasi disimpan!")}>
                <Save size={14} /> Simpan Pengaturan
              </button>
            </div>
          </div>
        )}

        {/* ── Security Tab ───────────────────────────────────── */}
        {tab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Change Password */}
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

              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 460 }}>
                {([
                  { key: "current", label: "Password Saat Ini" },
                  { key: "newPw",   label: "Password Baru" },
                  { key: "confirm", label: "Konfirmasi Password Baru" },
                ] as { key: keyof typeof showPw; label: string }[]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPw[key] ? "text" : "password"}
                        className="form-input" style={{ paddingRight: 44 }}
                        value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder="••••••••"
                      />
                      <button type="button"
                        onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 4 }}>
                  <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}
                    onClick={() => { setPwForm({ current: "", newPw: "", confirm: "" }); save("Password berhasil diperbarui!"); }}>
                    <Lock size={14} /> Perbarui Password
                  </button>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Shield size={18} color="var(--primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Informasi Keamanan</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Login Terakhir",    "31 Mei 2026, 14:07 WIB"],
                  ["Perangkat",         "Chrome 124 / Windows 11"],
                  ["IP Address",        "182.168.1.x"],
                  ["Sesi Aktif",        "1 perangkat"],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{lbl}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-danger btn-sm" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
                Keluar dari Semua Sesi
              </button>
            </div>
          </div>
        )}
      </main>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <style>{`
        @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
