"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { authService } from "@/services/auth.service";
import { useAuthStore, getRoleRedirect } from "@/store/authStore";
import { studentService } from "@/services/student.service";
import { parentService } from "@/services/parent.service";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const storeLogin = useAuthStore((s) => s.login);
  const setStudentProfileId = useAuthStore((s) => s.setStudentProfileId);
  const setParentProfileId = useAuthStore((s) => s.setParentProfileId);

  const benefits = [
    "Akses cepat ke portofolio digital siswa",
    "Pantau iuran & pembayaran secara real-time",
    "Laporan perkembangan belajar terintegrasi",
    "Notifikasi aktivitas terbaru",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1️⃣ Login — backend hanya return { access_token }
      const data = await authService.login({ email, password });

      if (!data || !data.access_token) {
        throw new Error("Token otentikasi tidak ditemukan dari server.");
      }

      // 2️⃣ Simpan token dulu agar persist saat page reload
      if (typeof window !== "undefined") {
        localStorage.setItem("askala_token", data.access_token);
      }

      // 🌟 SOLUSI ANTI-RACE CONDITION: Injeksi token langsung ke header default Axios
      if (api.defaults.headers.common) {
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
      }

      // 3️⃣ Ambil data user via /auth/me menggunakan token yang diinjeksi di atas
      const user = await authService.me();

      if (!user) {
        throw new Error("Gagal mengambil informasi profil akun Anda.");
      }

      // 4️⃣ Simpan ke Zustand store
      storeLogin(user, data.access_token);

      // 🌟 SOLUSI AMAN UNDEFINED TEXT: Gunakan fallback berlapis untuk notifikasi ucapan selamat datang
      const loginDisplayName = user.firstName || user.lastName || user.email?.split("@")[0] || "Pengguna";
      toast.success(`Selamat datang kembali, ${loginDisplayName}!`);

      // 5️⃣ Resolve student/parent profile ID (non-critical)
      try {
        if (user.role === "STUDENT") {
          const students = await studentService.getAll();
          const mine = students.find((s) => s.userId === user.id);
          if (mine) setStudentProfileId(mine.id);
        } else if (user.role === "PARENT") {
          const parent = await parentService.getByUserId(user.id);
          if (parent) setParentProfileId(parent.id);
        }
      } catch {
        // Non-critical — tidak memblokir login
      }

      // 6️⃣ Redirect sesuai role secara aman
      if (user.role) {
        window.location.href = getRoleRedirect(user.role);
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err: unknown) {
      console.error("Login Error Log:", err);
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const raw = axiosErr?.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw.join(", ")
        : (raw ?? "Email atau password salah. Silakan coba lagi.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .shimmer-text-login {
          background: linear-gradient(90deg, #FFCC00 0%, #fff 40%, #FFCC00 60%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .login-input {
          width: 100%; padding: 11px 44px 11px 44px;
          border: 1.5px solid #E2E8F0; border-radius: 12px;
          font-size: 14px; font-weight: 500; color: #0F172A;
          background: #FAFBFC; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          font-family: 'Inter', sans-serif;
        }
        .login-input.no-licon { padding-left: 14px; }
        .login-input:focus { border-color: #027E74; background: #fff; box-shadow: 0 0 0 4px rgba(2,126,116,.08); }
        .login-input::placeholder { color: #94A3B8; font-weight: 400; }
        .login-submit-btn {
          width: 100%; padding: 14px; background: #027E74; color: #fff;
          border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: background .2s, transform .15s, box-shadow .2s;
          font-family: 'Inter', sans-serif; box-shadow: 0 4px 16px rgba(2,126,116,.25);
          position: relative; overflow: hidden;
        }
        .login-submit-btn:not(:disabled):hover { background: #02635c; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(2,126,116,.32); }
        .login-submit-btn:disabled { opacity: 0.72; cursor: not-allowed; }
        @media (max-width: 768px) {
          .login-auth-grid { grid-template-columns: 1fr !important; }
          .login-auth-right { display: none !important; }
          .login-auth-grid > div:first-child { width: 100%; min-height: 100vh; padding: 32px 24px !important; }
        }
      `}</style>

      <div className="login-auth-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
        {/* ── LEFT PANEL: FORM ── */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px", background: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(2,126,116,.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(2,126,116,.03)", pointerEvents: "none" }} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                Selamat datang kembali
              </h1>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, fontWeight: 400 }}>
                Masuk ke akun Askala Anda untuk melanjutkan aktivitas.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: "0.03em" }}>Alamat Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" className="login-input" style={{ paddingLeft: 40 }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.03em" }}>Password</label>
                  <a href="#" style={{ fontSize: 12, color: "#027E74", fontWeight: 600, textDecoration: "none" }} onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")} onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}>Lupa password?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password Anda" className="login-input" style={{ paddingLeft: 40, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", padding: 0 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ height: 1, background: "#F1F5F9" }} />

              <button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? (
                  <>
                    <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#94A3B8", fontWeight: 400 }}>
              Belum punya akun?{" "}
              <Link href="/register" style={{ color: "#027E74", fontWeight: 700, textDecoration: "none" }} onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")} onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}>Daftar sekarang</Link>
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL: BRANDING ── */}
        <div className="login-auth-right" style={{ position: "relative", background: "url('/login-register/login.svg') center/cover no-repeat", display: "flex", flexDirection: "column", justifyContent: "flex-start", padding: "40px 48px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(transparent calc(100% - 1px), rgba(255,255,255,.04) 1px)", backgroundSize: "100% 60px" }} />

          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", position: "relative", zIndex: 2 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: "-0.5px" }}>Askala</span>
          </Link>

          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 760, marginTop: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,204,0,.15)", border: "1px solid rgba(255,204,0,.25)", borderRadius: 999, padding: "8px 16px", marginBottom: 28 }}>
              <Sparkles size={12} color="#FFCC00" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FFCC00" }}>Platform Digital Sekolah</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "start", marginBottom: 40 }}>
              <div>
                <h2 style={{ fontSize: 45, fontWeight: 800, lineHeight: 1.05, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <span style={{ color: "#fff" }}>Akses Penuh</span><br />
                  <span className="shimmer-text-login">Ekosistem Digital.</span>
                </h2>
              </div>
              <div style={{ paddingTop: 10 }}>
                <p style={{ fontSize: 18, color: "rgba(255,255,255,.88)", lineHeight: 1.7, margin: 0, maxWidth: 340 }}>
                  Login dan nikmati kemudahan mengelola portofolio, iuran, dan komunikasi sekolah.
                </p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 48px", maxWidth: 760 }}>
              {benefits.map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: "rgba(255,204,0,.15)", border: "1px solid rgba(255,204,0,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={14} color="#FFCC00" />
                  </div>
                  <span style={{ fontSize: 16, color: "rgba(255,255,255,.88)", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}