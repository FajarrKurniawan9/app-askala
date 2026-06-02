// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

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
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "10px",
            },
            classNames: {
              success: "sonner-success",
              error: "sonner-error",
              info: "sonner-info",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}