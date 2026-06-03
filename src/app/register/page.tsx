"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight,
  GraduationCap, ShieldCheck, Users, User, Phone, Hash, CheckCircle2, Sparkles,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<"STUDENT" | "ADMIN" | "PARENT">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");

  const roles = [
    { id: "STUDENT" as const, label: "Siswa", icon: GraduationCap },
    { id: "ADMIN" as const, label: "Admin/Guru", icon: ShieldCheck },
    { id: "PARENT" as const, label: "Orang Tua", icon: Users },
  ];

  const benefits = [
    "Pendaftaran cepat dan gratis selamanya",
    "Data tersimpan aman & terenkripsi",
    "Akses dari perangkat apapun",
    "Dukungan teknis responsif 24/7",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }
    setLoading(true);
    try {
      // 🌟 SOLUSI DATA HYBRID: Mengirim properti gabungan `name` bersamaan dengan `firstName` & `lastName`
      await authService.register({
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email,
        password,
        role,
        phone: phone.trim() || undefined,
        nis: role === "STUDENT" && nis.trim() ? nis.trim() : undefined,
      });

      // 2️⃣ Registrasi berhasil — arahkan ke halaman login
      toast.success("Akun berhasil dibuat! Silakan login untuk melanjutkan.");
      window.location.href = "/login";

    } catch (err: unknown) {
      console.error("Register Error Log:", err);
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const raw = axiosErr?.response?.data?.message;
      const msg = Array.isArray(raw)
        ? raw.join(", ")
        : (raw ?? "Pendaftaran gagal. Coba lagi atau gunakan email lain.");
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
        .shimmer-text-reg {
          background: linear-gradient(90deg, #FFCC00 0%, #fff 40%, #FFCC00 60%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .reg-input {
          width: 100%; padding: 11px 44px 11px 44px;
          border: 1.5px solid #E2E8F0; border-radius: 12px;
          font-size: 14px; font-weight: 500; color: #0F172A;
          background: #FAFBFC; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          font-family: 'Inter', sans-serif;
        }
        .reg-input.no-licon { padding-left: 14px; }
        .reg-input:focus { border-color: #027E74; background: #fff; box-shadow: 0 0 0 4px rgba(2,126,116,.08); }
        .reg-input::placeholder { color: #94A3B8; font-weight: 400; }
        .reg-role-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 10px 4px; border-radius: 10px;
          border: 1.5px solid transparent; background: transparent;
          cursor: pointer; font-size: 11px; font-weight: 700; color: #94A3B8;
          transition: all .2s; font-family: 'Inter', sans-serif; line-height: 1;
        }
        .reg-role-btn:hover { color: #475569; background: #F1F5F9; }
        .reg-role-btn.active { background: #fff; color: #027E74; border-color: #027E74; box-shadow: 0 2px 8px rgba(2,126,116,.12); }
        .reg-submit-btn {
          width: 100%; padding: 14px; background: #027E74; color: #fff;
          border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: background .2s, transform .15s, box-shadow .2s;
          font-family: 'Inter', sans-serif; box-shadow: 0 4px 16px rgba(2,126,116,.25);
        }
        .reg-submit-btn:not(:disabled):hover { background: #02635c; transform: translateY(-1px); }
        .reg-submit-btn:disabled { opacity: 0.72; cursor: not-allowed; }
        @media (max-width: 768px) {
          .reg-auth-grid { grid-template-columns: 1fr !important; }
          .reg-auth-left { display: none !important; }
        }
      `}</style>

      <div className="reg-auth-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
        {/* ── LEFT PANEL ── */}
        <div className="reg-auth-left" style={{ position: "relative", background: "url('/login-register/register.svg') center/cover no-repeat", display: "flex", flexDirection: "column", justifyContent: "flex-start", padding: "40px 48px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", position: "relative", zIndex: 2 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: "-0.5px" }}>Askala</span>
          </Link>

          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 760, marginTop: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,204,0,.15)", border: "1px solid rgba(255,204,0,.25)", borderRadius: 999, padding: "8px 16px", marginBottom: 28 }}>
              <Sparkles size={12} color="#FFCC00" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FFCC00" }}>Daftar Gratis Sekarang</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "start", marginBottom: 40 }}>
              <div>
                <h2 style={{ fontSize: 45, fontWeight: 800, lineHeight: 1.05, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <span style={{ color: "#fff" }}>Mulai Perjalanan</span><br />
                  <span className="shimmer-text-reg">Digital Anda.</span>
                </h2>
              </div>
              <div style={{ paddingTop: 10 }}>
                <p style={{ fontSize: 18, color: "rgba(255,255,255,.88)", lineHeight: 1.7, margin: 0, maxWidth: 340 }}>
                  Bergabunglah bersama siswa, guru, dan orang tua dalam satu ekosistem digital Askala.
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

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px", background: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(2,126,116,.04)", pointerEvents: "none" }} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                Buat akun baru
              </h1>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, fontWeight: 400 }}>
                Isi data di bawah ini untuk mendaftar ke platform Askala.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Daftar sebagai
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "6px", background: "#F8FAFC", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button key={r.id} type="button" onClick={() => { setRole(r.id); setNis(""); }} className={`reg-role-btn ${role === r.id ? "active" : ""}`}>
                      <Icon size={18} />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: "0.03em" }}>Nama Depan *</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input type="text" required placeholder="Budi" className="reg-input" style={{ paddingLeft: 40 }} value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: "0.03em" }}>Nama Belakang *</label>
                  <input type="text" required placeholder="Santoso" className="reg-input no-licon" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: "0.03em" }}>Alamat Email *</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="email" required placeholder="nama@sekolah.sch.id" className="reg-input" style={{ paddingLeft: 40 }} value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: "0.03em" }}>Nomor Telepon</label>
                <div style={{ position: "relative" }}>
                  <Phone size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="tel" placeholder="+62 812 3456 7890" className="reg-input" style={{ paddingLeft: 40 }} value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <AnimatePresence>
                {role === "STUDENT" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: "0.03em" }}>NIS (Nomor Induk Siswa)</label>
                    <div style={{ position: "relative" }}>
                      <Hash size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input type="text" placeholder="2024001234" className="reg-input" style={{ paddingLeft: 40 }} value={nis} onChange={e => setNis(e.target.value)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, letterSpacing: "0.03em" }}>Password *</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type={showPass ? "text" : "password"} required placeholder="Min. 8 karakter" className="reg-input" style={{ paddingLeft: 40, paddingRight: 44 }} value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", padding: 0 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <input type="checkbox" id="agree-reg" required style={{ marginTop: 2, accentColor: "#027E74", width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
                <label htmlFor="agree-reg" style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, cursor: "pointer" }}>
                  Saya menyetujui{" "}
                  <a href="#" style={{ color: "#027E74", fontWeight: 700, textDecoration: "none" }}>Syarat & Ketentuan</a>{" "}
                  dan{" "}
                  <a href="#" style={{ color: "#027E74", fontWeight: 700, textDecoration: "none" }}>Kebijakan Privasi</a> Askala.
                </label>
              </div>

              <div style={{ height: 1, background: "#F1F5F9" }} />

              <button type="submit" disabled={loading} className="reg-submit-btn">
                {loading ? (
                  <>
                    <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                    <span>Mendaftar...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#94A3B8", fontWeight: 400 }}>
              Sudah punya akun?{" "}
              <Link href="/login" style={{ color: "#027E74", fontWeight: 700, textDecoration: "none" }} onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")} onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}>Login di sini</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}