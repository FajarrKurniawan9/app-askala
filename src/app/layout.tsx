import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Askala — Jejak Setiap Prestasi",
  description:
    "Platform digital sekolah berbasis web untuk mengelola portofolio siswa, aktivitas organisasi, dan transaksi kegiatan sekolah secara transparan dan terintegrasi.",
  keywords: ["askala", "portofolio siswa", "manajemen sekolah", "transaksi kegiatan", "organisasi sekolah"],
  authors: [{ name: "Askala Team" }],
  openGraph: {
    title: "Askala — Jejak Setiap Prestasi",
    description: "Platform digital sekolah berbasis web",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
