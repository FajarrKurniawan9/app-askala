import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jejak — Track Every Achievement",
  description:
    "Platform digital sekolah berbasis web untuk mengelola portofolio siswa, aktivitas organisasi, dan transaksi kegiatan sekolah secara transparan dan terintegrasi.",
  keywords: ["jejak", "portofolio siswa", "manajemen sekolah", "transaksi kegiatan", "organisasi sekolah"],
  authors: [{ name: "Jejak Team" }],
  openGraph: {
    title: "Jejak — Track Every Achievement",
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
