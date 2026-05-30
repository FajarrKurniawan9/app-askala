"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight } from "lucide-react";

export default function LoginPage() {
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
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="login-grid">
      {/* Left panel */}
      <div
        className="grid-bg"
        style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", padding: 48, position: "relative", overflow: "hidden",
        }}
      >
        {/* Decorative */}
        <div style={{
          position: "absolute", top: -60, left: -60, width: 240, height: 240,
          background: "rgba(2,126,116,.07)", borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -40, right: -40, width: 180, height: 180,
          background: "rgba(2,126,116,.05)", borderRadius: "50%",
        }} />

        <div style={{ maxWidth: 420, width: "100%", position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, background: "var(--primary)", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, color: "var(--primary)" }}>
              Jejak
            </span>
          </Link>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.2 }}>
            Selamat datang! 👋
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 32 }}>
            Masuk ke akun Jejak Anda untuk melanjutkan
          </p>

          {/* Role selector */}
          <div style={{ marginBottom: 28 }}>
            <p className="form-label">Masuk sebagai</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {(["student", "admin", "parent"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: 8,
                    border: `2px solid ${role === r ? roleMap[r].color : "var(--border)"}`,
                    background: role === r ? `${roleMap[r].color}15` : "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    color: role === r ? roleMap[r].color : "var(--text-muted)",
                    transition: "all .15s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{roleMap[r].emoji}</span>
                  {roleMap[r].label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="form-label">Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="var(--text-muted)" style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="nama@sekolah.sch.id"
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                  Lupa password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-muted)" style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="Masukkan password"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite",
                  }} />
                  Memproses...
                </span>
              ) : (
                <>Masuk <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        background: "var(--primary)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", padding: 48, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80, width: 320, height: 320,
          background: "rgba(255,255,255,.06)", borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60, width: 240, height: 240,
          background: "rgba(255,255,255,.04)", borderRadius: "50%",
        }} />

        <div style={{ maxWidth: 380, position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, background: "rgba(255,255,255,.15)",
            borderRadius: 20, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 32px",
          }}>
            <BookOpen size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Track Every Achievement.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.75)", lineHeight: 1.7, marginBottom: 40 }}>
            Platform digital sekolah yang mengintegrasikan portofolio siswa, organisasi, dan transaksi kegiatan.
          </p>

          {[
            "Portofolio digital siswa",
            "Verifikasi pembayaran real-time",
            "Kas organisasi transparan",
            "Monitoring orang tua",
          ].map((item) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 14, textAlign: "left",
            }}>
              <div style={{
                width: 24, height: 24, background: "rgba(255,255,255,.2)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <ChevronRight size={12} color="#fff" />
              </div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,.85)", fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-grid > div:last-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}
