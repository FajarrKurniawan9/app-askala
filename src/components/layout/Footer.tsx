"use client";
import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin, Globe, MessageSquare, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0F172A",
        color: "#94a3b8",
        padding: "60px 0 24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--primary)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={20} color="#fff" />
              </div>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "#fff",
                }}
              >
                Askala
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Platform digital sekolah untuk mengelola portofolio siswa, organisasi, dan transaksi kegiatan secara transparan.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {[Globe, MessageSquare, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#1e293b",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    transition: "background .15s, color .15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--primary)";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#1e293b";
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Platform</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Dashboard Siswa", "Dashboard Admin", "Dashboard Orang Tua", "Portofolio Digital", "Manajemen Pembayaran"].map((item) => (
                <li key={item}>
                  <a href="#" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", transition: "color .15s" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--primary)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#94a3b8")}
                  >{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Dukungan</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Pusat Bantuan", "Dokumentasi", "Kebijakan Privasi", "Syarat & Ketentuan"].map((item) => (
                <li key={item}>
                  <a href="#" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", transition: "color .15s" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--primary)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#94a3b8")}
                  >{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Kontak</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { Icon: Mail, text: "hello@askala.id" },
                { Icon: Phone, text: "+62 812 3456 7890" },
                { Icon: MapPin, text: "Jakarta, Indonesia" },
              ].map(({ Icon, text }) => (
                <li key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                  <Icon size={14} color="var(--primary)" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #1e293b",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 13 }}>© 2026 Jejak. Seluruh hak dilindungi.</p>
          <p style={{ fontSize: 13 }}>
            Dibuat dengan ❤️ untuk pendidikan Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
