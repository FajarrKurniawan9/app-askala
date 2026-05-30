"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<"student" | "admin" | "parent">("student");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "student") window.location.href = "/student";
      else if (role === "admin") window.location.href = "/admin";
      else window.location.href = "/parent";
    }, 1200);
  };

  const roleMap = {
    student: { label: "Siswa", color: "var(--primary)", emoji: "👨‍🎓" },
    admin:   { label: "Admin / Guru", color: "var(--danger)", emoji: "🛡️" },
    parent:  { label: "Orang Tua", color: "var(--warning)", emoji: "👪" },
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="reg-grid">
      {/* Left panel */}
      <div style={{
        background: "var(--primary)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", padding: 48, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, left: -80, width: 320, height: 320,
          background: "rgba(255,255,255,.06)", borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -60, right: -60, width: 240, height: 240,
          background: "rgba(255,255,255,.04)", borderRadius: "50%",
        }} />
        <div style={{ maxWidth: 380, position: "relative", zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, background: "rgba(255,255,255,.15)",
            borderRadius: 20, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 32px",
          }}>
            <BookOpen size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 16, textAlign: "center" }}>
            Mulai Perjalanan Digital Anda
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)", lineHeight: 1.7, marginBottom: 32, textAlign: "center" }}>
            Bergabung bersama 2,400+ siswa yang sudah mendokumentasikan prestasi mereka di Jejak.
          </p>
          {[
            "Gratis selamanya untuk siswa",
            "Data tersimpan aman & terenkripsi",
            "Akses dari perangkat apapun",
            "Dukungan 24/7",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <CheckCircle size={16} color="rgba(255,255,255,.8)" />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,.85)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="grid-bg" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 48 }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: "var(--primary)" }}>Jejak</span>
          </Link>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
            Buat Akun Baru
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>
            Isi data di bawah untuk mendaftar
          </p>

          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <p className="form-label">Daftar sebagai</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {(["student", "admin", "parent"] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  style={{
                    padding: "10px 8px", borderRadius: 8,
                    border: `2px solid ${role === r ? roleMap[r].color : "var(--border)"}`,
                    background: role === r ? `${roleMap[r].color}15` : "#fff",
                    cursor: "pointer", fontWeight: 600, fontSize: 12,
                    color: role === r ? roleMap[r].color : "var(--text-muted)",
                    transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}>
                  <span style={{ fontSize: 18 }}>{roleMap[r].emoji}</span>
                  {roleMap[r].label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="form-label">Nama Depan</label>
                <div style={{ position: "relative" }}>
                  <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="text" className="form-input" placeholder="Budi" style={{ paddingLeft: 38 }} required />
                </div>
              </div>
              <div>
                <label className="form-label">Nama Belakang</label>
                <input type="text" className="form-input" placeholder="Santoso" required />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="email" className="form-input" placeholder="nama@sekolah.sch.id" style={{ paddingLeft: 38 }} required />
              </div>
            </div>

            <div>
              <label className="form-label">No. Telepon</label>
              <div style={{ position: "relative" }}>
                <Phone size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="tel" className="form-input" placeholder="+62 812 3456 7890" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            {role === "student" && (
              <div>
                <label className="form-label">NIS (Nomor Induk Siswa)</label>
                <input type="text" className="form-input" placeholder="2024001234" />
              </div>
            )}

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type={showPass ? "text" : "password"} className="form-input" placeholder="Min. 8 karakter" style={{ paddingLeft: 38, paddingRight: 42 }} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4 }}>
              <input type="checkbox" id="agree" required style={{ marginTop: 2, accentColor: "var(--primary)", width: 16, height: 16 }} />
              <label htmlFor="agree" style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Saya menyetujui{" "}
                <a href="#" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Syarat & Ketentuan</a>{" "}
                dan{" "}
                <a href="#" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Kebijakan Privasi</a> Jejak.
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15 }} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  Mendaftar...
                </span>
              ) : (<>Daftar Sekarang <ArrowRight size={16} /></>)}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            Sudah punya akun?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Masuk</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .reg-grid { grid-template-columns: 1fr !important; }
          .reg-grid > div:first-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}
