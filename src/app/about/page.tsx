"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  Star,
  Sparkles,
  Clock,
  Users,
  MessageSquare,
  Target,
  Award,
  TrendingUp,
  CheckCircle2,
  Quote,
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Years Experience", value: "3.5", suffix: "+", icon: Clock },
    { label: "Positive Reviews", value: "830", suffix: "+", icon: Star },
    { label: "Project Challenge", value: "23", suffix: "", icon: Target },
    { label: "Trusted Students", value: "100K", suffix: "+", icon: Users },
  ];

  const values = [
    {
      title: "Inovasi",
      desc: "Kami terus berinovasi menghadirkan fitur terbaik untuk pendidikan.",
      icon: Sparkles,
    },
    {
      title: "Kolaborasi",
      desc: "Bekerja sama dengan sekolah, guru, dan orang tua untuk sukses bersama.",
      icon: Users,
    },
    {
      title: "Transparansi",
      desc: "Semua informasi dan data terbuka, dapat diakses dengan mudah.",
      icon: CheckCircle2,
    },
    {
      title: "Dampak Nyata",
      desc: "Fokus pada hasil nyata yang meningkatkan kualitas pembelajaran.",
      icon: TrendingUp,
    },
  ];

  return (
    <div style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          padding: "140px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/sma3nmalang.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.05,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 2 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--primary-light)",
              color: "var(--primary)",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            <Sparkles size={13} />
            Tentang Askala
          </div>
          <h1
            style={{
              fontSize: "clamp(38px, 6vw, 56px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              marginBottom: 24,
              letterSpacing: "-1px",
            }}
          >
            Mengubah{" "}
            <span style={{ color: "var(--primary)" }}>Ekosistem Digital</span>{" "}
            Pendidikan
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 2.5vw, 18px)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: 650,
              margin: "0 auto",
            }}
          >
            Askala hadir sebagai platform digital yang menghubungkan siswa,
            guru, dan orang tua dalam satu ekosistem terintegrasi.
          </p>
        </motion.div>
      </section>

      {/* How It Started + Story */}
      <section style={{ padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 48,
              alignItems: "center",
            }}
          >
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                style={{
                  borderRadius: 32,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src="/about/started.png"
                  alt="How It Started"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/600x400/027E74/white?text=Askala+Story";
                  }}
                />
              </div>
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#FFF1D6",
                  borderRadius: 999,
                  padding: "4px 12px",
                  marginBottom: 20,
                }}
              >
                <Quote size={14} color="#F59E0B" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#B45309" }}>
                  How It Started
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: 20,
                  lineHeight: 1.2,
                }}
              >
                Our Dream is <br />
                <span style={{ color: "var(--primary)" }}>
                  Global Learning Transformation
                </span>
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  marginBottom: 24,
                }}
              >
                Askala didirikan oleh <strong>Fadi Alyuliansyah</strong>, seorang
                pembelajar sejati, dan <strong>Muhammad Fajar Kurniawan</strong>,
                pendidik visioner. Mimpi mereka adalah menciptakan platform
                digital yang menghubungkan seluruh ekosistem sekolah dengan
                transparan dan modern.
              </p>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  marginBottom: 24,
                }}
              >
                Dengan dedikasi tanpa lelah, mereka mengumpulkan tim ahli dan
                meluncurkan platform inovatif ini, membangun komunitas global
                pembelajar yang terhubung untuk mengeksplorasi, belajar, dan
                berkembang bersama.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  marginTop: 20,
                }}
              >
                {stats.map((s, idx) => (
                  <div key={idx} style={{ textAlign: "center", minWidth: 100 }}>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "var(--primary)",
                      }}
                    >
                      {s.value}
                      {s.suffix}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values / Why Choose Us */}
      <section style={{ padding: "60px 24px", background: "#F8FAFE" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              className="badge badge-primary"
              style={{ marginBottom: 16, display: "inline-block" }}
            >
              Core Values
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              Askala untuk <span style={{ color: "var(--primary)" }}>Bhawikarsu</span>!
            </h2>
            <p
              style={{
                maxWidth: 600,
                margin: "0 auto",
                color: "var(--text-secondary)",
              }}
            >
              Prinsip yang kami pegang untuk memberikan layanan terbaik.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 32,
            }}
          >
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    background: "#fff",
                    borderRadius: 24,
                    padding: 32,
                    textAlign: "center",
                    boxShadow: "0 10px 30px -12px rgba(0,0,0,0.08)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 20,
                      background: "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                    }}
                  >
                    <Icon size={28} color="var(--primary)" />
                  </div>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 12,
                      color: "var(--text-primary)",
                    }}
                  >
                    {val.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {val.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet Our Founders */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              className="badge badge-success"
              style={{ marginBottom: 16, display: "inline-block" }}
            >
              The Team
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              Dibalik <span style={{ color: "var(--primary)" }}>Askala</span>
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Mereka yang percaya bahwa teknologi bisa mengubah pendidikan.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 40,
            }}
          >
            {[
              {
                name: "Fadi Alyuliansyah",
                role: "Frontend Engineer",
                bio: "Pembelajar sejati dengan pengalaman 10+ tahun di edutech.",
                img: "/about/fadi.jpg",
                initial: "AS",
                color: "#027E74",
              },
              {
                name: "Muhammad Fajar Kurniawan",
                role: "Backend Engineer",
                bio: "Doktor pendidikan dengan visi transformasi digital sekolah.",
                img: "/about/fajar.jpg",
                initial: "MW",
                color: "#FFCC00",
              },
            ].map((founder, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: "#fff",
                  borderRadius: 32,
                  overflow: "hidden",
                  boxShadow: "0 20px 35px -12px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    background: founder.color,
                    padding: 32,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {founder.img ? (
                    <img
                      src={founder.img}
                      alt={founder.name}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid white",
                      }}
                      onError={(e) => {
                        // fallback to initials
                        (e.target as HTMLImageElement).style.display = "none";
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const div = document.createElement("div");
                          div.style.width = "140px";
                          div.style.height = "140px";
                          div.style.borderRadius = "50%";
                          div.style.background = "#fff";
                          div.style.display = "flex";
                          div.style.alignItems = "center";
                          div.style.justifyContent = "center";
                          div.style.fontSize = "48px";
                          div.style.fontWeight = "bold";
                          div.style.color = founder.color;
                          div.innerText = founder.initial;
                          parent.appendChild(div);
                          (e.target as HTMLImageElement).remove();
                        }
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 48,
                        fontWeight: "bold",
                        color: founder.color,
                      }}
                    >
                      {founder.initial}
                    </div>
                  )}
                </div>
                <div style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
                    {founder.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--primary)",
                      fontWeight: 600,
                      marginBottom: 14,
                    }}
                  >
                    {founder.role}
                  </p>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {founder.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              background: "var(--primary)",
              borderRadius: 32,
              padding: "56px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                background: "rgba(255,255,255,.05)",
                borderRadius: "50%",
              }}
            />
            <Target size={40} color="rgba(255,255,255,.8)" style={{ marginBottom: 20 }} />
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Jadi bagian dari perjalanan kami
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,.8)",
                marginBottom: 32,
                lineHeight: 1.7,
              }}
            >
              Bergabunglah bersama ribuan siswa, guru, dan orang tua yang sudah
              merasakan kemudahan platform Askala.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "#FFCC00",
                  color: "#027E74",
                  borderRadius: 40,
                  padding: "14px 28px",
                  fontWeight: 800,
                  fontSize: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 6px 0 #E6A800",
                  textDecoration: "none",
                }}
              >
                Mulai Gratis <ArrowRight size={18} />
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "#FFFFFF",
                  color: "#027E74",
                  borderRadius: 40,
                  padding: "14px 28px",
                  fontWeight: 800,
                  fontSize: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 6px 0 #d1d5db",
                  textDecoration: "none",
                }}
              >
                Hubungi Kami
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-primary {
          background: var(--primary-light);
          color: var(--primary);
        }
        .badge-success {
          background: #D1FAE5;
          color: #065F46;
        }
        :root {
          --bg: #FFFFFF;
          --primary: #027E74;
          --primary-light: #E6F6F4;
          --text-primary: #0F172A;
          --text-secondary: #334155;
          --text-muted: #64748B;
          --border: #E2E8F0;
        }
      `}</style>
    </div>
  );
}