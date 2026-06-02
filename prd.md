# `PRD.md` — Askala

## Student Activity & Portfolio System

---

# 1. Product Overview

## Product Name

# **Askala**

## Tagline

> *Track Every Achievement.*

## Product Description

Askala adalah platform digital sekolah berbasis web yang dirancang untuk membantu pengelolaan portofolio siswa, aktivitas organisasi, dan transaksi kegiatan sekolah secara transparan dan terintegrasi.

Platform ini memungkinkan:

* siswa membangun portofolio digital,
* guru/admin mengelola dan memverifikasi data,
* orang tua memantau perkembangan siswa secara real-time,
* organisasi sekolah mengelola kas dan iuran kegiatan dengan lebih terstruktur.

---

# 2. Problem Statement

Sekolah masih menghadapi beberapa permasalahan:

* Data prestasi dan organisasi siswa tersebar dan tidak terdokumentasi dengan baik.
* Proses administrasi kegiatan masih manual.
* Transparansi pembayaran kegiatan dan kas organisasi kurang jelas.
* Orang tua sulit memantau perkembangan siswa secara real-time.
* Pengelolaan data dan transaksi kegiatan belum terintegrasi dalam satu sistem.

---

# 3. Goals

## Primary Goals

* Mendigitalisasi data akademik dan non-akademik siswa.
* Menyediakan sistem portofolio siswa yang modern.
* Menyediakan sistem transaksi kegiatan sekolah sederhana.
* Mempermudah administrasi guru dan organisasi sekolah.
* Meningkatkan transparansi kepada orang tua.

## Secondary Goals

* Menjadi pusat aktivitas digital siswa.
* Menjadi media dokumentasi prestasi siswa.
* Menjadi sistem administrasi kegiatan sekolah yang efisien.

---

# 4. Target Users

## 1. Student (Siswa)

Kebutuhan:

* Melihat portofolio pribadi.
* Mengelola prestasi dan aktivitas.
* Melihat tagihan iuran.
* Upload bukti pembayaran.

---

## 2. Admin / Guru

Kebutuhan:

* Mengelola data siswa.
* Memverifikasi pembayaran.
* Mengelola transaksi organisasi.
* Mengelola data kegiatan sekolah.

---

## 3. Parent (Orang Tua)

Kebutuhan:

* Memantau aktivitas siswa.
* Melihat status pembayaran.
* Memantau perkembangan siswa.

---

# 5. Core Features

# A. Authentication System

## Features

* Login
* Register
* Logout
* JWT Authentication
* Protected Routes
* Session Management

## Roles

* Student
* Admin/Guru
* Parent

## Acceptance Criteria

✅ User dapat login dengan email & password
✅ Token tersimpan setelah login
✅ User tidak dapat mengakses protected page tanpa login
✅ Logout menghapus session/token

---

# B. Student Portfolio

## Features

* Tambah prestasi
* Tambah organisasi
* Tambah eskul
* Upload sertifikat/bukti
* Activity timeline

## Acceptance Criteria

✅ Data dapat ditambahkan
✅ Data dapat di-edit
✅ Data dapat dihapus
✅ Data tampil di dashboard siswa

---

# C. Transaction Module

## 1. Extracurricular Dues (Iuran Eskul)

### Flow

1. Admin membuat tagihan
2. Siswa melihat tagihan
3. Siswa upload bukti pembayaran
4. Admin verifikasi pembayaran

### Status

* pending
* paid
* rejected

## Acceptance Criteria

✅ Tagihan tampil pada dashboard siswa
✅ Bukti pembayaran dapat diupload
✅ Admin dapat approve/reject pembayaran
✅ Status pembayaran berubah secara real-time setelah refresh data

---

## 2. Organization Cash Flow (Kas Organisasi)

### Features

* Pemasukan kas
* Pengeluaran kas
* Riwayat transaksi
* Transparansi kas

### Acceptance Criteria

✅ Data pemasukan dapat ditambahkan
✅ Data pengeluaran dapat ditambahkan
✅ Semua transaksi tampil dalam tabel/list
✅ Total kas otomatis dihitung

---

## 3. Activity Fund

### Features

* Dana kegiatan sekolah
* Riwayat pengeluaran acara
* Transparansi dana kegiatan

### Acceptance Criteria

✅ Admin dapat membuat data kegiatan
✅ Dana masuk/keluar dapat dicatat
✅ Semua anggota dapat melihat riwayat transaksi kegiatan

---

# 6. User Flow

# Student Flow

```txt
Login/Register
    ↓
Dashboard
    ↓
Melihat Portofolio
    ↓
Tambah Prestasi / Organisasi
    ↓
Melihat Tagihan
    ↓
Upload Bukti Pembayaran
    ↓
Menunggu Verifikasi
```

---

# Admin Flow

```txt
Login
    ↓
Dashboard Admin
    ↓
Mengelola Data Siswa
    ↓
Membuat Tagihan
    ↓
Memverifikasi Pembayaran
    ↓
Mengelola Kas Organisasi
```

---

# Parent Flow

```txt
Login
    ↓
Dashboard Parent
    ↓
Melihat Aktivitas Anak
    ↓
Melihat Status Pembayaran
    ↓
Monitoring Progress
```

---

# 7. Use Case

| Role    | Use Case                       |
| ------- | ------------------------------ |
| Student | Mengupload prestasi            |
| Student | Upload bukti pembayaran        |
| Student | Melihat riwayat aktivitas      |
| Admin   | Membuat tagihan                |
| Admin   | Verifikasi pembayaran          |
| Admin   | Mengelola kas organisasi       |
| Parent  | Melihat status pembayaran anak |
| Parent  | Memantau aktivitas siswa       |

---

# 8. Frontend Stack (Recommended)

## Main Framework

### Next.js

Digunakan sebagai framework utama frontend.

## Styling

### Tailwind CSS

Untuk utility-first modern styling.

## UI Components

### shadcn/ui

Digunakan untuk:

* dialog
* form
* table
* dropdown
* sheet
* toast
* tabs
* card
* sidebar

## Icons

### Lucide

## Form Validation

### React Hook Form + Zod

## State Management

### Zustand

## API Fetching

### Axios atau TanStack Query

## Charts

### Recharts

## Table Management

### TanStack Table

---

# 9. Frontend Architecture

# Folder Structure

```txt
src/
│
├── app/
├── components/
├── features/
├── lib/
├── services/
├── hooks/
├── store/
├── types/
├── utils/
└── styles/
```

---

# Feature-based Structure

```txt
features/
│
├── auth/
├── dashboard/
├── achievements/
├── organizations/
├── payments/
├── treasury/
└── profile/
```

---

# 10. UI/UX Direction

## Design Style

* Modern dashboard
* Clean academic UI
* **Primary Color: #027E74 (Teal/Hijau tua)**
* **Secondary: #FFFFFF (Putih)**
* **Accent/Warning/Danger: Merah (#DC2626 atau #EF4444) untuk notifikasi, error, tombol hapus, peringatan.**
* **Hindari GRADIENT sepenuhnya** → semua background, tombol, card harus solid color.
* **Tipografi: Sans-serif (Inter, Poppins)**
* **Border radius: rounded-lg atau rounded-xl (konsisten)**
* **Bayangan: shadow-sm atau shadow-md, tidak terlalu berat.**

## Landing Page Hero Section

### Wajib memiliki:

- **Header / Hero section** dengan **grid background kotak-kotak** (grid pattern menggunakan CSS `background-image: repeating-linear-gradient`).
- Warna background hero: putih (#FFFFFF) atau teal sangat muda, tapi tetap solid.
- Grid color: #E2E8F0 atau #CBD5E1 dengan opacity rendah.
- Tombol CTA (App Store, dll) menggunakan warna #027E74 dengan teks putih, tanpa gradient.

---

# 11. Color Palette (Final)

## Primary Brand (Hijau)

```txt
#027E74   (Teal gelap - utama untuk tombol, link, header)
```

## Secondary (Putih)

```txt
#FFFFFF   (Background card, sidebar, hero)
```

## Background Umum

```txt
#F4F6F9   (Abu sangat muda, solid)
```

## Merah (Danger / Error / Hapus / Peringatan)

```txt
#DC2626   (Red 600)
atau
#EF4444   (Red 500)
```

## Hijau Muda (Success / Verified)

```txt
#10B981   (Emerald 500) – jika perlu, tapi tetap solid
```

## Abu-abu Teks

```txt
#334155   (Slate 700 untuk teks biasa)
#64748B   (Slate 500 untuk teks sekunder)
```

## Border

```txt
#E2E8F0
```

---

# 12. Dashboard UI Recommendation

# Student Dashboard

## Sections

* Welcome card (solid putih, border teal tipis)
* Total achievements
* Active organizations
* Upcoming dues
* Payment status (merah untuk pending, hijau untuk paid)
* Activity timeline

## Components

* Stats card – background putih, border kiri tebal warna #027E74
* Table – striped rows, hover effect
* Badge – solid warna (hijau/merah/teal)
* Timeline – aksen garis teal

---

# Admin Dashboard

## Sections

* Total students
* Pending payments (ditampilkan dengan badge merah)
* Total cash flow
* Monthly transaction graph

## Components

* Analytics cards
* Data table
* Pie chart (warna teal, merah, abu)
* Bar chart
* Verification queue – status pending ditandai merah

---

# Parent Dashboard

## Sections

* Student profile
* Recent activities
* Payment history (kolom status: merah jika belum bayar)
* Achievement timeline

---

# 13. API Structure (Frontend Ready)

# Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

# Achievements

```http
GET    /api/achievements
POST   /api/achievements
PUT    /api/achievements/:id
DELETE /api/achievements/:id
```

---

# Payments

```http
GET  /api/payments
POST /api/payments/upload
PUT  /api/payments/:id/verify
```

---

# Treasury

```http
GET  /api/treasury
POST /api/treasury
PUT  /api/treasury/:id
DELETE /api/treasury/:id
```

---

# 14. Database Schema

# users

```txt
id
name
email
password
role
created_at
```

---

# achievements

```txt
id
student_id
title
description
certificate_file
created_at
```

---

# extracurriculars

```txt
id
name
coach
created_at
```

---

# extracurricular_dues

```txt
id
extracurricular_id
title
amount
due_date
created_by
```

---

# payments

```txt
id
dues_id
student_id
proof_file
status
verified_by
created_at
```

---

# organization_cashflow

```txt
id
organization_name
type
title
amount
created_by
created_at
```

---

# 15. Notification System

## Notification Types

* success – hijau solid (#10B981)
* error – merah solid (#DC2626)
* loading – teal (#027E74)
* warning – merah/oranye

## Recommended UI

* toast notification (posisi bottom-right atau top-right)
* confirmation modal (border merah untuk aksi hapus)
* loading skeleton (abu-abu solid, tanpa shimmer gradient)

---

# 16. Responsive Design

## Breakpoints

* Mobile: < 640px
* Tablet: 640px - 1024px
* Desktop: > 1024px

## Requirements

✅ Sidebar collapse menjadi bottom navigation di mobile
✅ Table overflow dengan horizontal scroll
✅ Card grid: 1 kolom mobile, 2-3 kolom desktop
✅ Touch-friendly UI (tombol minimum 44x44px)

---

# 17. MVP Scope

# INCLUDED

✅ Authentication
✅ Role management
✅ Student portfolio
✅ Payment verification
✅ Organization cash flow
✅ Dashboard analytics
✅ CRUD system
✅ API integration

---

# EXCLUDED

❌ Payment gateway
❌ QRIS
❌ Auto transfer
❌ Realtime websocket
❌ Complex accounting
❌ Multi-school system
❌ AI recommendation

---

# 18. Success Metrics

## Technical

* API response < 2s
* Responsive on mobile
* Stable authentication flow

## User

* Siswa dapat upload data dengan mudah
* Guru dapat memverifikasi pembayaran lebih cepat
* Orang tua dapat melihat data secara transparan

---

# 19. Final Product Positioning

> Askala bukan hanya platform administrasi sekolah, tetapi pusat aktivitas digital siswa yang mengintegrasikan portofolio, organisasi, dan transparansi transaksi kegiatan dalam satu sistem modern berbasis web.

---

# 20. Implementation Instructions for Claude AI (Agent)

Agar Claude dapat menghasilkan kode frontend yang maksimal sesuai desain di atas, ikuti panduan detail berikut:

### A. Prioritas Utama

1. **Zero Gradient** – Periksa semua file CSS, Tailwind config, dan komponen. Pastikan tidak ada `bg-gradient-to-r`, `from-`, `to-`, `linear-gradient`. Semua warna solid.
2. **Warna Hijau #027E74** – Gunakan sebagai primary button, link aktif, border aktif, icon aktif.
3. **Warna Merah (#DC2626 atau #EF4444)** – Untuk tombol hapus, status pending, peringatan, error badge.
4. **Hero Section Grid Background** – Implementasikan dengan:
   ```css
   .hero-grid-bg {
     background-image: repeating-linear-gradient(
       0deg,
       transparent,
       transparent 20px,
       rgba(2, 126, 116, 0.05) 20px,
       rgba(2, 126, 116, 0.05) 40px
     );
   }
   ```
   atau pola kotak-kotak:
   ```css
   background-image: 
     linear-gradient(to right, #e2e8f0 1px, transparent 1px),
     linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
   background-size: 32px 32px;
   ```

### B. Struktur Komponen Landing Page

Buat `app/page.tsx` dengan:

- **Header** (logo Askala, menu: Features, Dashboard, Pricing, Login/Register) – background putih solid, shadow ringan.
- **Hero Section**:
  - Grid background seperti di atas.
  - Judul besar: "Track Every Achievement" dengan warna #027E74 atau #0F172A.
  - Subjudul sesuai PRD.
  - Dua tombol: "Get Started" (hijau #027E74) dan "Learn More" (outline hijau).
  - Mockup aplikasi (jika ada) dari gambar referensi, atau card preview.
- **Features section** (3-4 card dengan icon, border tipis, hover border hijau).
- **Awards / Stats section** (seperti di foto: School challenge, Sports, Projects).
- **Testimonial** (komentar orang tua – seperti di foto: Karin Castillo, dll).
- **Call to Action** dengan grid background juga.
- **Footer**.

### C. Dashboard Layout (setelah login)

- **Sidebar** (collapse) dengan background putih solid, item menu berwarna abu, aktif berwarna #027E74.
- **Navbar** (profil, notifikasi) – putih solid.
- **Dashboard Cards** – statistik dengan border kiri tebal #027E74.
- **Tabel** – pakai TanStack Table, status menggunakan Badge: hijau untuk *paid*, merah untuk *pending*, merah tua untuk *rejected*.
- **Tombol** – semua tombol primary: `bg-[#027E74] text-white hover:bg-[#02635c]`, tanpa gradient, tanpa shadow berlebihan. Tombol secondary: border `#027E74` text `#027E74`.
- **Form** – input border `#E2E8F0`, focus border `#027E74`, ring `#027E74` (opacity 20%).

### D. Implementasi Spesifik dari Gambar Referensi

Berdasarkan gambar yang di-upload (tampilan "Explore your child's performance"):

- Di landing page, buat section **"Explore your child's performance"** dengan grid 2 kolom (kiri: teks, kanan: ilustrasi atau card).
- Tampilkan **"Real-time updates and announcements"** seperti di gambar: card dengan tanggal, judul, badge "Competition!", tombol "Read more" berwarna #027E74.
- Tampilkan **"Connect with teachers"** – daftar komentar (Karin Castillo, "Good morning!...", "This is so cool!...").
- Pastikan tidak ada gradient di card-card tersebut.

### E. Mobile Responsiveness Detail

- Sidebar: di mobile, gunakan `<Sheet>` dari shadcn untuk menu hamburger.
- Tabel payment: buat `Card` untuk setiap transaksi di mobile.
- Grid background hero di mobile: ubah ukuran grid menjadi 16px x 16px agar tidak terlalu rapat.

### F. Daftar Perintah Langsung untuk Claude (Prompt Template)

Bila Anda memberikan PRD ini ke Claude, sertakan instruksi:

> "Gunakan Tailwind CSS + shadcn/ui. Warna primary #027E74, warna merah #DC2626. Jangan gunakan gradient apapun di background, button, card, atau teks. Landing page hero harus memiliki pola grid kotak-kotak menggunakan CSS repeating-linear-gradient. Tampilkan section seperti di gambar referensi: 'Explore your child’s performance', 'Real-time updates', 'Connect with teachers'. Semua komponen harus solid color, rounded-lg, bayangan halus. Pastikan responsive."

### G. Quality Assurance Checklist untuk Claude

- [ ] Cek seluruh file `globals.css` – tidak ada `linear-gradient`.
- [ ] Cek `tailwind.config.js` – tidak ada custom gradient plugin.
- [ ] Cek button variant – semuanya solid.
- [ ] Hero section memiliki `background-image` grid.
- [ ] Warna merah digunakan untuk status pending, hapus, error.
- [ ] Warna hijau #027E74 untuk primary action.
- [ ] Semua tabel memiliki status badge yang jelas.
- [ ] Form validasi menggunakan react-hook-form + zod.
- [ ] Toast notifikasi menggunakan sonner atau shadcn toast, warna sesuai (hijau/merah solid).

---

**End of PRD**