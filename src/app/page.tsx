"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { useRef, useState, useEffect  } from "react";
import Footer from "@/components/layout/Footer";
import {
  Trophy, Users, BookOpen, CreditCard,
  ArrowRight, CheckCircle, Star, TrendingUp,
  Shield, Zap, Eye, ChevronRight, Calendar,
  Award, BarChart3, Bell, Clock, Target, Sparkles, ShieldCheck, GraduationCap, CheckCircle2
} from "lucide-react";

/* ─── Mock Data ──────────────────────────────────────────────── */
const features = [
  {
    icon: Trophy,
    title: "Portofolio Digital",
    desc: "Dokumentasikan setiap prestasi, sertifikat, dan pencapaian akademik maupun non-akademik siswa dalam satu tempat.",
  },
  {
    icon: CreditCard,
    title: "Manajemen Pembayaran",
    desc: "Kelola iuran kegiatan dan ekstrakurikuler secara transparan. Upload bukti bayar dan pantau status verifikasi.",
  },
  {
    icon: Users,
    title: "Kas Organisasi",
    desc: "Catat pemasukan dan pengeluaran kas organisasi sekolah. Semua anggota bisa melihat riwayat transaksi.",
  },
  {
    icon: Eye,
    title: "Monitoring Orang Tua",
    desc: "Orang tua dapat memantau perkembangan, aktivitas, dan status pembayaran anak secara real-time.",
  },
  {
    icon: Shield,
    title: "Verifikasi Admin",
    desc: "Admin dan guru dapat memverifikasi pembayaran, mengelola data siswa, dan membuat tagihan dengan mudah.",
  },
  {
    icon: BarChart3,
    title: "Analitik & Laporan",
    desc: "Dashboard analitik lengkap dengan grafik transaksi bulanan, statistik siswa, dan laporan kas organisasi.",
  },
];

const stats = [
  { label: "Siswa Aktif", value: "2,400+", icon: Users },
  { label: "Prestasi Tercatat", value: "8,900+", icon: Trophy },
  { label: "Transaksi Terverifikasi", value: "15,000+", icon: CheckCircle },
  { label: "Sekolah Terdaftar", value: "48+", icon: BookOpen },
];

const updates = [
  {
    date: "27 Mei 2026",
    title: "Lomba Sains Nasional 2026",
    badge: "Kompetisi!",
    badgeColor: "var(--danger)",
    desc: "Pendaftaran dibuka hingga 15 Juni 2026. Segera daftarkan tim Anda!",
  },
  {
    date: "20 Mei 2026",
    title: "Pentas Seni Tahunan",
    badge: "Acara",
    badgeColor: "var(--warning)",
    desc: "Persiapan pentas seni dimulai. Cek jadwal latihan di portal.",
  },
  {
    date: "15 Mei 2026",
    title: "Iuran OSIS Periode Juni",
    badge: "Pembayaran",
    badgeColor: "var(--primary)",
    desc: "Tagihan iuran OSIS bulan Juni sudah tersedia di dashboard Anda.",
  },
];

const testimonials = [
  {
    name: "Ibu Kartini",
    role: "Orang Tua Siswa",
    initials: "IK",
    color: "#027E74",
    text: "Sekarang saya bisa pantau perkembangan anak dari HP kapan saja. Status pembayaran juga langsung update, tidak perlu tanya ke sekolah lagi!",
    rating: 5,
  },
  {
    name: "Pak Budi Santoso",
    role: "Guru & Admin",
    initials: "BS",
    color: "#DC2626",
    text: "Verifikasi pembayaran yang dulu butuh waktu lama kini bisa selesai dalam hitungan menit. Sangat membantu administrasi sekolah.",
    rating: 5,
  },
  {
    name: "Rizky Pratama",
    role: "Siswa Kelas XI",
    initials: "RP",
    color: "#10B981",
    text: "Semua prestasi dan sertifikat saya tersimpan rapi di sini. Pas mau daftar beasiswa tinggal share link portofolio!",
    rating: 5,
  },
];

/* ─── Komponen kecil untuk fitur item di kartu ────────────── */
const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <li style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#2d3748" }}>
    <Sparkles size={16} color="#f6ad55" style={{ flexShrink: 0 }} />
    <span>{children}</span>
  </li>
);

/* ─── Component ─────────────────────────────────────────────── */
export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

const isDragging = useRef(false);

const startX = useRef(0);

const targetScroll = useRef(0);

const currentScroll = useRef(0);

const animationFrame = useRef<number | null>(null);

const animateScroll = () => {
  if (!scrollRef.current) return;

  currentScroll.current +=
    (targetScroll.current - currentScroll.current) * 0.08;

  scrollRef.current.scrollLeft =
    currentScroll.current;

  animationFrame.current =
    requestAnimationFrame(animateScroll);
};

useEffect(() => {
  animateScroll();

  return () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
  };
}, []);

const onPointerDown = (
  e: React.PointerEvent<HTMLDivElement>
) => {
  if (!scrollRef.current) return;

  isDragging.current = true;

  startX.current = e.clientX;

  targetScroll.current =
    scrollRef.current.scrollLeft;

  currentScroll.current =
    scrollRef.current.scrollLeft;

  scrollRef.current.style.cursor =
    "grabbing";
};

const onPointerMove = (
  e: React.PointerEvent<HTMLDivElement>
) => {
  if (!isDragging.current) return;

  const dx = e.clientX - startX.current;

  targetScroll.current -= dx * 1.2;

  startX.current = e.clientX;
};

const stopDragging = () => {
  if (!scrollRef.current) return;

  isDragging.current = false;

  scrollRef.current.style.cursor =
    "grab";
};

  return (
    <div style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* ── Hero Section ── */}
      <section
        className=""
        style={{
          padding: "430px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background video layer (z-index 0) - responsive */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0,
          }}
        >
          <source src="/video/SMAN3MALANG.mp4" type="video/mp4" />
        </video>

        {/* Decorative circles (z-index 2) */}
        <div style={{
          position: "absolute", top: -80, right: -80, width: 300, height: 300,
          background: "rgba(2, 126, 116, 0)", borderRadius: "50%",
          zIndex: 2,
        }} />

        <div style={{
          position: "absolute", bottom: -60, left: -60, width: 200, height: 200,
          background: "rgba(2,126,116,.04)", borderRadius: "50%",
          zIndex: 2,
        }} />

        <div
          className="hero-content"
          style={{
            maxWidth: 800,
            margin: "20px auto",
            position: "relative",
            zIndex: 2,
            transform: "translateY(-450px)"
          }}
        >
          {/* Pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--primary-light)", color: "var(--primary)",
            borderRadius: 999, padding: "6px 16px", fontSize: 13, fontWeight: 600,
            marginBottom: 28, border: "1px solid rgba(2,126,116,.2)",
          }}>
          
            Digitalisasi Bhumi Bhawikarsu
          </div>
<h1
  style={{
    fontSize: "clamp(38px, 6vw, 64px)",
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 24,
    letterSpacing: "-1px",
  }}
>
  Jejak Setiap{" "}
  <span className="shimmer-text">
    Prestasi.
  </span>
</h1>

          <p style={{
            fontSize: "clamp(15px, 2.5vw, 18px)", color: "#030303",
            lineHeight: 1.7, marginBottom: 40, maxWidth: 620, margin: "0 auto 40px",
          }}>
            Menghubungkan seluruh siswa, organisasi, dan guru di SMA Negeri 3 Malang dalam satu ekosistem digital yang terintegrasi.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
  
   {/* BUTTON PRIMARY */}
  <Link
    href="/register"
    className="hero-btn hero-btn-primary"
  >
    <span className="hero-btn-shine" />

    <span
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      Mulai Gratis
      <ArrowRight size={18} />
    </span>
  </Link>

  {/* BUTTON SECONDARY */}
  <a
    href="#features"
    className="hero-btn hero-btn-secondary"
  >
    <span className="hero-btn-shine" />

    <span
      style={{
        position: "relative",
        zIndex: 2,
      }}
    >
      Lihat Fitur
    </span>
  </a>
</div>
        </div>

        <style>{`
          .hero-content {
            padding-top: 40px;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @media (max-width: 768px) {
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-4px); }
            }

            .hero-content {
              padding-top: 30px;
              transform: translateY(-40px);

              
            }
          }

          @media (max-width: 640px) {
            [data-stats-container] {
              gap: 24px !important;
              padding: 24px 32px !important;
              borderRadius: 24px !important;
            }

            .hero-content {
              padding-top: 20px;
              transform: translateY(-30px);
            }
          }
            .hero-btn {
   position: relative;
  overflow: hidden;

  padding: 22px 44px; /* ukuran button */
  font-size: 18px;
  font-weight: 800;

  border-radius: 28px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  transition: all .25s ease;

  transform-style: preserve-3d;
  cursor: pointer;

  text-decoration: none;
}

/* PRIMARY */
.hero-btn-primary {
  background: #027E74;
  color: white;

  border: 2px solid #027E74;

  box-shadow:
    0 8px 0 #015e56,
    0 18px 30px rgba(2,126,116,.18);
}

/* SECONDARY */
.hero-btn-secondary {
  background: #FFCC00;
  color: #027E74;

  border: 2px solid #FFCC00;

  box-shadow:
    0 8px 0 #d9ab00,
    0 18px 30px rgba(255,204,0,.22);
}

/* SHINE EFFECT */
.hero-btn-shine {
  position: absolute;

  inset: 0;

  background:
    linear-gradient(
      120deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,.18) 45%,
      rgba(255,255,255,.35) 50%,
      rgba(255,255,255,.18) 55%,
      rgba(255,255,255,0) 100%
    );

  transform: translateX(-140%);

  transition: transform .6s ease;

  z-index: 1;
}

/* HOVER */
.hero-btn:hover {
  transform:
    translateY(-6px)
    scale(1.08)
    rotate(-2deg);

  filter: brightness(1.03);
}

/* ACTIVE */
.hero-btn:active {
  transform:
    translateY(2px)
    scale(.98);

  box-shadow:
    0 4px 0 rgba(0,0,0,.18);
}

/* SHINE MOVE */
.hero-btn:hover .hero-btn-shine {
  transform: translateX(140%);
}

/* SECOND BUTTON DIFFERENT ROTATION */
.hero-btn-secondary:hover {
  transform:
    translateY(-6px)
    rotate(2deg)
    scale(1.06);
}

/* ========================= */
/* SHIMMER TEXT */
/* ========================= */

@keyframes shimmerText {
  0% {
    background-position: -400% center;
  }
  100% {
    background-position: 400% center;
  }
}

.shimmer-text {
  display: inline-block;

  background: linear-gradient(
    90deg,
    #027E74 0%,
    #027E74 35%,
    #ffed89 50%,
    #027E74 65%,
    #027E74 100%
  );

  background-size: 400% 100%;

  -webkit-background-clip: text;
  background-clip: text;

  -webkit-text-fill-color: transparent;
  color: transparent;

  animation: shimmerText 12.0s linear infinite;
}
  
/* MOBILE */
@media (max-width: 640px) {
  .hero-btn {
    width: 100%;
  }

}


        `}</style>

      </section>

      {/* ── Dashboard Preview Cards ── */}
      <section style={{ 
      padding: "90px 24px", 
      backgroundImage: "url('/your-image.svg')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
      }}>
        <div style={{ maxWidth: 1200, margin: "auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 28,
          }}>
            {/* Student Card */}
            <motion.div
              whileHover={{ scale: 1.03, rotate: -0.5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                background: "#fff5f5",
                borderRadius: 32,
                padding: 28,
                border: "4px solid #fc8181",
                boxShadow: "0 12px 0 #fc8181, 0 20px 30px -12px rgba(0,0,0,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.15 }}>
                <GraduationCap size={100} color="#fc8181" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <span style={{
                    background: "#fc8181", color: "#fff", padding: "6px 14px", borderRadius: 40,
                    fontSize: 12, fontWeight: 700, letterSpacing: 0.5, display: "inline-block", marginBottom: 10,
                  }}>
                    👨‍🎓 Siswa
                  </span>
                  <h3 style={{ fontSize: 22, color: "#c53030", fontWeight: 800, lineHeight: 1.3 }}>
                    Dashboard Siswa
                  </h3>
                </div>
                
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                <FeatureItem>Kelola portofolio digital</FeatureItem>
                <FeatureItem>Upload bukti pembayaran</FeatureItem>
                <FeatureItem>Lihat tagihan iuran</FeatureItem>
                <FeatureItem>Activity timeline</FeatureItem>
              </ul>
              <Link href="/login" passHref>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fc8181",
                    color: "#fff",
                    border: "none",
                    borderRadius: 40,
                    padding: "12px 20px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 6px 0 #c53030",
                    transition: "all 0.1s ease",
                  }}
                >
                  Masuk sebagai Siswa <ArrowRight size={14} />
                </motion.button>
              </Link>
            </motion.div>

            {/* Admin Card */}
            <motion.div
              whileHover={{ scale: 1.03, rotate: 0.5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                background: "#edf2ff",
                borderRadius: 32,
                padding: 28,
                border: "4px solid #4c51bf",
                boxShadow: "0 12px 0 #4c51bf, 0 20px 30px -12px rgba(0,0,0,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.15 }}>
                <ShieldCheck size={100} color="#4c51bf" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <span style={{
                    background: "#4c51bf", color: "#fff", padding: "6px 14px", borderRadius: 40,
                    fontSize: 12, fontWeight: 700, letterSpacing: 0.5, display: "inline-block", marginBottom: 10,
                  }}>
                    🛡️ Admin
                  </span>
                  <h3 style={{ fontSize: 22, color: "#2c3070", fontWeight: 800, lineHeight: 1.3 }}>
                    Dashboard Admin
                  </h3>
                </div>
              
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                <FeatureItem>Kelola data siswa</FeatureItem>
                <FeatureItem>Verifikasi pembayaran</FeatureItem>
                <FeatureItem>Buat tagihan iuran</FeatureItem>
                <FeatureItem>Kas organisasi</FeatureItem>
              </ul>
              <Link href="/login" passHref>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#4c51bf",
                    color: "#fff",
                    border: "none",
                    borderRadius: 40,
                    padding: "12px 20px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 6px 0 #2c3070",
                    transition: "all 0.1s ease",
                  }}
                >
                  Masuk sebagai Admin <ArrowRight size={14} />
                </motion.button>
              </Link>
            </motion.div>

            {/* Parent Card */}
            <motion.div
              whileHover={{ scale: 1.03, rotate: -0.5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                background: "#f0fff4",
                borderRadius: 32,
                padding: 28,
                border: "4px solid #38a169",
                boxShadow: "0 12px 0 #38a169, 0 20px 30px -12px rgba(0,0,0,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.15 }}>
                <Eye size={100} color="#38a169" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <span style={{
                    background: "#38a169", color: "#fff", padding: "6px 14px", borderRadius: 40,
                    fontSize: 12, fontWeight: 700, letterSpacing: 0.5, display: "inline-block", marginBottom: 10,
                  }}>
                    👪 Orang Tua
                  </span>
                  <h3 style={{ fontSize: 22, color: "#22543d", fontWeight: 800, lineHeight: 1.3 }}>
                    Dashboard Orang Tua
                  </h3>
                </div>
                
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                <FeatureItem>Pantau aktivitas anak</FeatureItem>
                <FeatureItem>Lihat status pembayaran</FeatureItem>
                <FeatureItem>Monitor perkembangan</FeatureItem>
                <FeatureItem>Notifikasi real-time</FeatureItem>
              </ul>
              <Link href="/login" passHref>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#38a169",
                    color: "#fff",
                    border: "none",
                    borderRadius: 40,
                    padding: "12px 20px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 6px 0 #22543d",
                    transition: "all 0.1s ease",
                  }}
                >
                  Masuk sebagai Orang Tua <ArrowRight size={14} />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Section ── */}
{/* ── Features Bento Section ── */}
<section
  id="features"
  style={{
    padding: "90px 24px",
    background: "var(--bg)",
  }}
>
  <div style={{ maxWidth: 1180, margin: "0 auto" }}>
    
    {/* Heading */}
    <div
      style={{
        textAlign: "center",
        marginBottom: 56,
      }}
    >
      <span
        className="badge badge-primary"
        style={{ marginBottom: 18 }}
      >
        ✨ Smart Features
      </span>

      <h2
        className="section-title"
        style={{
          marginBottom: 14,
          maxWidth: 700,
          marginInline: "auto",
        }}
      >
        Platform sekolah yang modern,
        <br />
        simpel & menyenangkan.
      </h2>

      <p
        className="section-sub"
        style={{
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        Semua aktivitas sekolah dalam satu dashboard yang
        lebih interaktif dan mudah digunakan.
      </p>
    </div>

    {/* Bento Layout */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 20,
      }}
    >
      {/* BIG CARD - Student Portfolio (NO IMAGE) */}
      <div
        className="card"
        style={{
          gridColumn: "span 6",
          minHeight: 320,
          padding: 32,
          borderRadius: 28,
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              fontSize: 26,
            }}
          >
            🎓
          </div>

          <h3
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 12,
              color: "var(--text-primary)",
            }}
          >
            Student Portfolio
          </h3>

          <p
            style={{
              color: "var(--text-muted)",
              lineHeight: 1.8,
              maxWidth: 420,
              margin: "0 auto",
            }}
          >
            Simpan sertifikat, project, organisasi,
            dan seluruh perjalanan siswa dalam
            satu tempat.
          </p>
        </div>
      </div>

      {/* SMALL CARD - Smart Cash (NO IMAGE) */}
      <div
        className="card"
        style={{
          gridColumn: "span 3",
          minHeight: 320,
          padding: 28,
          borderRadius: 28,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: "#FFF1D6",
              margin: "0 auto 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            💳
          </div>

          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Smart Cash
          </h3>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--text-muted)",
            }}
          >
            Kelola kas kelas & organisasi
            dengan transparan.
          </p>
        </div>
      </div>

      {/* SMALL CARD - Activity Tracker (NO IMAGE) */}
      <div
        className="card"
        style={{
          gridColumn: "span 3",
          minHeight: 320,
          padding: 28,
          borderRadius: 28,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: "#DDF4FF",
              margin: "0 auto 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            📊
          </div>

          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Activity Tracker
          </h3>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--text-muted)",
            }}
          >
            Pantau kegiatan siswa
            secara realtime.
          </p>
        </div>
      </div>

      {/* WIDE CARD - Smart Notification (NO IMAGE) */}
      <div
        className="card"
        style={{
          gridColumn: "span 4",
          minHeight: 240,
          padding: 28,
          borderRadius: 28,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 34,
              marginBottom: 12,
            }}
          >
            🔔
          </div>

          <h3
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 10,
            }}
          >
            Smart Notification
          </h3>

          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.7,
            }}
          >
            Informasi sekolah langsung
            masuk ke semua siswa.
          </p>
        </div>
      </div>

      {/* WIDE CARD - One Dashboard Experience (WITH IMAGE) */}
      <div
        className="card"
        style={{
          gridColumn: "span 8",
          minHeight: 240,
          padding: 32,
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 30,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "#E9E3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              marginBottom: 18,
            }}
          >
            🚀
          </div>

          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            One Dashboard Experience
          </h3>

          <p
            style={{
              color: "var(--text-muted)",
              lineHeight: 1.8,
              maxWidth: 420,
            }}
          >
            Semua kebutuhan sekolah —
            portfolio, organisasi, kas,
            hingga aktivitas siswa dalam
            satu sistem terintegrasi.
          </p>
        </div>

        {/* HANYA card ini yang punya gambar */}
        <img
          src="/dashboard.svg"
          alt="Dashboard preview"
          style={{
            width: "100%",
            maxWidth: 280,
            borderRadius: 20,
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  </div>
</section>

      {/* ── Testimonials SaaS Section ── */}
<section
  id="testimonial"
  style={{
    padding: "110px 24px",
    background: "var(--bg)",
    overflow: "hidden",
  }}
>
  <div style={{ maxWidth: 1240, margin: "0 auto" }}>

    {/* HEADER */}
    <div
      style={{
        textAlign: "center",
        marginBottom: 56,
      }}
    >
      <span
        className="badge badge-success"
        style={{ marginBottom: 18 }}
      >
        💬 Testimonials
      </span>

      <h2
        className="section-title"
        style={{
          marginBottom: 16,
          maxWidth: 720,
          marginInline: "auto",
          lineHeight: 1.1,
        }}
      >
        Trusted by schools,
        parents & students
      </h2>

      <p
        className="section-sub"
        style={{
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        Jejak membantu sekolah menjadi lebih modern,
        transparan, dan terhubung dalam satu platform.
      </p>
    </div>

    {/* TOP STATS */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 18,
        marginBottom: 40,
      }}
    >
      {[
        { value: "120+", label: "Schools Joined" },
        { value: "15K+", label: "Students Active" },
        { value: "98%", label: "Parent Satisfaction" },
        { value: "24/7", label: "Realtime Access" },
      ].map((item) => (
        <div
          key={item.label}
          className="card"
          style={{
            padding: 24,
            borderRadius: 24,
            textAlign: "center",
            border: "1.5px solid var(--border)",
            background: "#fff",
          }}
        >
          <h3
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 8,
              color: "var(--text-primary)",
            }}
          >
            {item.value}
          </h3>

          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>

    {/* SCROLL TESTIMONIALS */}
    <div
  ref={scrollRef}
  onPointerDown={onPointerDown}
  onPointerMove={onPointerMove}
  onPointerUp={stopDragging}
  onPointerLeave={stopDragging}
  className="testimonial-scroll"
      style={{
  display: "flex",
  gap: 22,
  overflowX: "auto",
  paddingBottom: 10,

  cursor: "grab",

  userSelect: "none",

  WebkitOverflowScrolling: "touch",

  scrollbarWidth: "none",

  msOverflowStyle: "none",

  willChange: "transform",

  transform: "translate3d(0,0,0)",

  scrollBehavior: "auto",

  overscrollBehaviorX: "contain",

  scrollSnapType: "none",
}}
    >

      {[
        {
          name: "Sarah Wijaya",
          role: "Parent",
          initials: "SW",
          color: "#6366F1",
          rating: 5,
          text: "Saya bisa memantau aktivitas dan pembayaran sekolah anak tanpa perlu bertanya manual lagi.",
        },
        {
          name: "Kevin Hartono",
          role: "Student",
          initials: "KH",
          color: "#F59E0B",
          rating: 5,
          text: "Portfolio digital membantu saya menyimpan semua sertifikat dan project dalam satu tempat.",
        },
        {
          name: "Rina Amelia",
          role: "Teacher",
          initials: "RA",
          color: "#10B981",
          rating: 5,
          text: "Komunikasi dengan orang tua jauh lebih mudah dan transparan sejak menggunakan Jejak.",
        },
        {
          name: "Michael Tan",
          role: "School Admin",
          initials: "MT",
          color: "#EC4899",
          rating: 5,
          text: "Dashboard kas organisasi dan laporan siswa sangat membantu operasional sekolah.",
        },
        {
          name: "Dila Maharani",
          role: "Parent",
          initials: "DM",
          color: "#8B5CF6",
          rating: 5,
          text: "Notifikasi realtime membuat saya tidak pernah ketinggalan informasi sekolah anak.",
        },
        {
          name: "Andra Saputra",
          role: "Student Council",
          initials: "AS",
          color: "#06B6D4",
          rating: 5,
          text: "Pengelolaan kegiatan organisasi jadi lebih rapi dan profesional dengan Jejak.",
        },
        {
          name: "Nadia Putri",
          role: "Vice Principal",
          initials: "NP",
          color: "#F97316",
          rating: 5,
          text: "Platform ini benar-benar membuat sekolah terasa lebih modern dan terintegrasi.",
        },
        {
          name: "Jonathan Lee",
          role: "Parent",
          initials: "JL",
          color: "#14B8A6",
          rating: 5,
          text: "Interface-nya sangat mudah digunakan bahkan untuk orang tua yang tidak terlalu tech-savvy.",
        },
      ].map((t, index) => (
        <motion.div
          whileHover={{
            y: -6,
          }}
          transition={{
            type: "spring",
            stiffness: 250,
          }}
          key={index}
          className="card testimonial-card"
          style={{
            minWidth: 340,
            maxWidth: 340,
            padding: 28,
            borderRadius: 30,
            background: "#fff",
            border: "1.5px solid var(--border)",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >

          {/* QUOTE ICON */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 22,
              fontSize: 42,
              opacity: 0.08,
              fontWeight: 900,
            }}
          >
            ”
          </div>

          {/* STARS */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 18,
            }}
          >
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star
                key={i}
                size={15}
                color="#F59E0B"
                fill="#F59E0B"
              />
            ))}
          </div>

          {/* TEXT */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.9,
              color: "var(--text-body)",
              marginBottom: 28,
            }}
          >
            “{t.text}”
          </p>

          {/* USER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: t.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {t.initials}
            </div>

            <div>
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 4,
                  color: "var(--text-primary)",
                }}
              >
                {t.name}
              </h4>

              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                {t.role}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      
      {/* ── CTA Section ── */}
      <section className="grid-bg-sm" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "var(--primary)", borderRadius: 20,
            padding: "56px 40px", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -40, right: -40, width: 200, height: 200,
              background: "rgba(255,255,255,.05)", borderRadius: "50%",
            }} />
            <Target size={40} color="rgba(255,255,255,.8)" style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "#fff", marginBottom: 16 }}>
              Siap digitalisasi sekolah Anda?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.8)", marginBottom: 32, lineHeight: 1.7 }}>
              Bergabung dengan 48+ sekolah yang sudah menggunakan Jejak untuk mengelola data siswa dan organisasi secara modern.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
  {/* Mulai Gratis */}
  <motion.a
    href="/register"
    whileHover={{ scale: 1.05, rotate: -1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300 }}
    style={{
      background: "#FFCC00",
      color: "#027E74",
      border: "none",
      borderRadius: 40,
      padding: "14px 28px",
      fontWeight: 800,
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      boxShadow: "0 6px 0 #E6A800",
      letterSpacing: 0.5,
      textDecoration: "none",
      lineHeight: 1.2,
    }}
  >
    Mulai Gratis
    <ArrowRight size={18} />
  </motion.a>

  {/* Lihat Fitur */}
  <motion.a
    href="#features"
    whileHover={{ scale: 1.05, rotate: 1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300 }}
    style={{
      background: "#FFFFFF",
      color: "#027E74",
      border: "none",
      borderRadius: 40,
      padding: "14px 28px",
      fontWeight: 800,
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      boxShadow: "0 6px 0 #d1d5db",
      letterSpacing: 0.5,
      textDecoration: "none",
      lineHeight: 1.2,
    }}
  >
    Lihat Fitur
  </motion.a>
</div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .grid-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
