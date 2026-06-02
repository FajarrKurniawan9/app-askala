# Rencana Integrasi Backend Askala (Final)

Dokumen ini merinci rencana integrasi frontend aplikasi Askala dengan backend API yang tersedia di `https://askala-siakad-system-production.up.railway.app`. Seluruh data fitur frontend telah diselaraskan dengan arsitektur endpoint backend yang ringkas dan terkonsolidasi (nested resources).

## User Review Required

> [!IMPORTANT]
> - **Environment Variable**: Pastikan backend URL (`https://askala-siakad-system-production.up.railway.app`) dikonfigurasi di file `.env.local` sebagai `NEXT_PUBLIC_API_URL`.
> - **Pemetaan Fitur Terkonsolidasi (Nested Resources)**:
>   - **Kegiatan (Activities) & Ekstrakurikuler (Extracurriculars)**: Terhubung langsung dan disimpan di bawah data siswa melalui endpoint `/students` (misalnya array bersarang/nested array pada `POST /students` atau `PATCH /students/{id}`).
>   - **Kas Organisasi (Treasury)**: Pengelolaan dana dan transaksi kas dikaitkan langsung dengan saldo organisasi melalui endpoint `/organizations` (atau nested data di dalamnya).
>   - **Halaman Pengaturan (Settings & School Info)**: Diperbarui melalui data akun administratif di `/users` atau detail profil `/auth/me`.
>   - **Pembayaran (Payments)**: Dipetakan langsung ke model tagihan di bawah endpoint `/bills`.

---

## Proposed Changes

### 1. Lingkungan & Konfigurasi Global (Base Configuration)

#### [NEW] [.env.local](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/.env.local)
- Buat file `.env.local` dari `.env.local.example`.
- Set nilai `NEXT_PUBLIC_API_URL` ke `https://askala-siakad-system-production.up.railway.app`.

#### [MODIFY] [api.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/lib/api.ts)
- Gunakan base URL dari `.env.local` secara konsisten.
- Tambahkan interceptor untuk menyertakan Bearer Token di header `Authorization` dari `localStorage` atau `useAuthStore` untuk setiap request.
- Tambahkan penanganan error global seperti penanganan status `401 Unauthorized` untuk otomatis melakukan redirect ke halaman `/login`.

---

### 2. Service Layer (API Connectors)

#### [MODIFY] [auth.service.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/services/auth.service.ts)
- Hubungkan method `login` ke `POST /auth/login`.
- Hubungkan method `register` ke `POST /auth/register`.
- Hubungkan method `me` ke `GET /auth/me`.
- Hubungkan method `logout` ke `POST /auth/logout`.

#### [NEW] [student.service.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/services/student.service.ts)
- Tambahkan CRUD siswa (termasuk array bersarang untuk **kegiatan/activities** dan **ekstrakurikuler**):
  - `getAll()` -> `GET /students`
  - `getById(id)` -> `GET /students/{id}`
  - `create(payload)` -> `POST /students`
  - `update(id, payload)` -> `PATCH /students/{id}` (untuk memperbarui profil siswa termasuk menambahkan/mengedit ekstrakurikuler dan daftar kegiatan siswa)
  - `delete(id)` -> `DELETE /students/{id}`

#### [NEW] [parent.service.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/services/parent.service.ts)
- Tambahkan CRUD profil orang tua:
  - `getAll()` -> `GET /parents`
  - `getById(id)` -> `GET /parents/{id}`
  - `create(payload)` -> `POST /parents`
  - `update(id, payload)` -> `PATCH /parents/{id}`
  - `delete(id)` -> `DELETE /parents/{id}`

#### [MODIFY] [portfolio.service.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/services/portfolio.service.ts)
- **Prestasi (Achievements)**:
  - `getAll()` -> `GET /achievements`
  - `create()` -> `POST /achievements`
  - `update()` -> `PATCH /achievements/{id}`
  - `remove()` -> `DELETE /achievements/{id}`
- **Organisasi (Organizations)**:
  - Sesuaikan endpoint dari `/student-orgs` ke `/organizations`.
  - Hubungkan CRUD ke `GET /organizations`, `POST /organizations`, `PATCH /organizations/{id}`, dan `DELETE /organizations/{id}`.
- **Ekstrakurikuler (Extracurriculars)**:
  - Dipetakan langsung menggunakan `studentService.update()` untuk menyimpan data ekstrakurikuler terbaru ke backend di `/students/{id}`.

#### [NEW] [bill.service.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/services/bill.service.ts)
- Menggantikan `payment.service.ts` agar selaras dengan skema `/bills` backend.
- Tambahkan CRUD tagihan/pembayaran siswa:
  - `getAll()` -> `GET /bills`
  - `getById(id)` -> `GET /bills/{id}`
  - `create(payload)` -> `POST /bills`
  - `updateStatus(id, status)` -> `PATCH /bills/{id}`
  - `delete(id)` -> `DELETE /bills/{id}`

#### [NEW] [upload.service.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/services/upload.service.ts)
- Tambahkan upload file sertifikat dan bukti transfer:
  - `uploadFile(file)` -> `POST /upload` (Mengembalikan URL file terunggah).

---

### 3. Sinkronisasi Global State & Halaman (Store & Pages)

#### [MODIFY] [authStore.ts](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/store/authStore.ts)
- Hubungkan action `login` untuk menyimpan data user asli dari respons API `/auth/login` dan menyimpan token di `localStorage`.
- Tambahkan fungsi sinkronisasi session (`syncSession`) untuk memanggil `/auth/me` pada saat inisialisasi aplikasi agar session tetap valid.

#### [MODIFY] [Halaman Dashboard & CRUD di UI](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app)
- Update file-file berikut untuk menggunakan API data daripada static mock data:
  - **Student Panel**:
    - [student/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/student/page.tsx) (Mengambil info siswa & kegiatan dari `/students`)
    - [student/portfolio/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/student/portfolio/page.tsx)
    - [student/payments/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/student/payments/page.tsx) (Mengambil tagihan dari `/bills`)
    - [student/achievements/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/student/achievements/page.tsx) (Mengambil prestasi dari `/achievements`)
    - [student/organizations/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/student/organizations/page.tsx) (Mengambil data organisasi dari `/organizations`)
  - **Admin Panel**:
    - [admin/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/admin/page.tsx)
    - [admin/students/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/admin/students/page.tsx) (CRUD siswa lengkap)
    - [admin/payments/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/admin/payments/page.tsx) (Verifikasi pembayaran via `/bills`)
    - [admin/settings/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/admin/settings/page.tsx) (Pengaturan sekolah & user di `/users`)
  - **Parent Panel**:
    - [parent/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/parent/page.tsx)
    - [parent/payments/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/parent/payments/page.tsx)
    - [parent/profile/page.tsx](file:///c:/Users/yulia/Documents/NEXTJS2026/askala-app/src/app/parent/profile/page.tsx)

---

## Verification Plan

### Automated Tests
- Menjalankan build production (`npm run build`) untuk memastikan tidak ada error TypeScript maupun type-checking di semua komponen yang terintegrasi.
- Menjalankan script test sederhana untuk mengetes konektivitas API dasar ke endpoint backend.

### Manual Verification
- Melakukan verifikasi login menggunakan berbagai tipe akun (Siswa, Admin, Orang Tua) dari database backend asli.
- Memastikan token Bearer dikirimkan di setiap request API (dapat dipantau via tab Network browser).
- Mengetes penambahan/edit data prestasi (Achievement) dan organisasi dari panel siswa, kemudian memverifikasi apakah data tersebut langsung terupdate di dashboard admin secara real-time.
- Melakukan pengujian upload berkas/sertifikat dan melacak URL response yang dikembalikan oleh backend.
