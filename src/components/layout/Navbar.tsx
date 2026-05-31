"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Menu, X, BookOpen, LayoutDashboard, CreditCard,
  Users, TrendingUp, Bell, ChevronDown,
} from "lucide-react";

const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "Testimonial", href: "#testimonial" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
              color: "var(--primary)",
              letterSpacing: "-0.5px",
            }}
          >
            Askala
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="nav-desktop">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-body)",
                textDecoration: "none",
                transition: "color .15s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--primary)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-body)")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login" className="btn btn-ghost btn-sm" style={{ display: "flex" }}>
            Masuk
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Daftar Gratis
          </Link>
          {/* Mobile toggle */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: "none" }}
            id="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div
          style={{
            background: "#fff",
            borderTop: "1px solid var(--border)",
            padding: "12px 24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-body)",
                textDecoration: "none",
              }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
