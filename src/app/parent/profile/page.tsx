"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import { toast } from "sonner";
import {
  User, Mail, Phone, MapPin, Lock, Save, X, Eye, EyeOff,
  BookOpen, Camera, AlertCircle,
} from "lucide-react";
import { useParent } from "@/lib/parentContext";
import { useAuthStore, getDisplayName } from "@/store/authStore";
import { parentService } from "@/services/parent.service";
import { userService } from "@/services/user.service";
import type { ApiParent, ApiStudent } from "@/lib/types";

export default function ParentProfilePage() {
  const { setSidebarOpen } = useParent();
  const { user, updateUser, parentProfileId, setParentProfileId } = useAuthStore();

  const [parent, setParent]   = useState<ApiParent | null>(null);
  const [student, setStudent] = useState<ApiStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // edit form state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [saving, setSaving]   = useState(false);

  // password modal
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm]   = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw]   = useState({ current: false, newPw: false, confirm: false });

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        let parentData: ApiParent | null = null;
        if (parentProfileId) {
          parentData = await parentService.getById(parentProfileId);
        } else {
          const found = await parentService.getByUserId(user.id);
          if (found) {
            parentData = found;
            setParentProfileId(found.id);
          }
        }
        setParent(parentData);
        setStudent(parentData?.students?.[0] ?? null);
      } catch (e) {
        console.error(e);
        setError("Gagal memuat profil.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, parentProfileId, setParentProfileId]);

  function startEdit() {
    if (!user) return;
    setForm({
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      phone:     user.phone ?? "",
    });
    setEditing(true);
  }

  function cancelEdit() { setEditing(false); }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      const updated = await userService.update(user.id, {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone || undefined,
      });
      updateUser(updated);
      setEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch {
      toast.error("Gagal memperbarui profil. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Password baru tidak cocok!"); return; }
    if (pwForm.newPw.length < 8) { toast.error("Password minimal 8 karakter!"); return; }
    if (!user) return;
    try {
      setSaving(true);
      await userService.update(user.id, { password: pwForm.newPw });
      setPwModal(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
      toast.success("Password berhasil diubah!");
    } catch {
      toast.error("Gagal mengubah password.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = getDisplayName(user);
  const initials    = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const studentName = student
    ? `${student.user.firstName} ${student.user.lastName}`.trim()
    : null;
  const studentInitials = studentName
    ? studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "—";

  return (
    <div className="main-content" style={{ flex: 1 }}>
      <Topbar
        title="Profil Orang Tua"
        subtitle="Kelola data diri dan akun Anda"
        role="parent"
        setSidebarOpen={setSidebarOpen}
      />

      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 780 }}>

        {error && (
          <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "14px 18px", color: "var(--danger)", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} />{error}
          </div>
        )}

        {/* Avatar Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName}
                  style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: 88, height: 88, background: "var(--warning)", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 28,
                }}>
                  {initials}
                </div>
              )}
              <button style={{
                position: "absolute", bottom: 0, right: 0, width: 28, height: 28,
                borderRadius: "50%", background: "var(--primary)", border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <Camera size={12} color="#fff" />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{displayName}</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{user?.email}</p>
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

        {/* Profile Info / Form */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <User size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Informasi Pribadi</h3>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : !editing ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                [Mail,  "Nama Lengkap", displayName],
                [Mail,  "Email",        user?.email ?? "—"],
                [Phone, "No. HP",       user?.phone ?? "—"],
                [MapPin,"Peran",        "Orang Tua / Wali"],
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
                  <label className="form-label">Nama Depan *</label>
                  <input className="form-input" required value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Nama Belakang</label>
                  <input className="form-input" value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" required value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">No. HP</label>
                  <input className="form-input" value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
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
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
              <div style={{ width: 24, height: 24, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : !student ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
              Data anak belum terhubung. Hubungi admin untuk mengaitkan data.
            </p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "var(--primary-light)", borderRadius: 10, border: "1px solid rgba(2,126,116,.15)" }}>
              <div style={{ width: 48, height: 48, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
                {studentInitials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{studentName}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  NIS: {student.nis} &nbsp;•&nbsp; {student.classRoom}
                  {student.major ? ` &nbsp;•&nbsp; ${student.major}` : ""}
                </p>
              </div>
              <span className="badge badge-success">Siswa Aktif</span>
            </div>
          )}
        </div>

      </main>

      {/* Change Password Modal */}
      {pwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setPwModal(false)}>
          <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Ganti Password</h3>
              <button onClick={() => setPwModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={18} /></button>
            </div>
            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                ["current", "Password Saat Ini"],
                ["newPw",   "Password Baru"],
                ["confirm", "Konfirmasi Password"],
              ] as [keyof typeof pwForm, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="form-label">{label} *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw[key] ? "text" : "password"}
                      className="form-input" required
                      style={{ paddingRight: 44 }}
                      value={pwForm[key]}
                      onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <button type="button"
                      onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
