# Full Backend Integration — Askala Frontend

Menghubungkan seluruh halaman frontend ke backend live API, memperbaiki semua ketidakcocokan enum, resolusi `studentId`, nama user dinamis, dan mengintegrasikan register flow.

## Proposed Changes

---

### Phase 1 — Fondasi Shared (Wajib Dikerjakan Pertama)

#### [MODIFY] types.ts
- Hapus seluruh tipe "legacy frontend" (`Achievement`, `StudentOrg`, `Extracurricular`, `Student`, `Payment`, `Transaction`, `Activity`, `Organization`, dll).
- Tambah tipe `ApiActivity` dan `ApiTransaction` yang sesuai backend.
- Perbaiki enum agar seragam dengan backend UPPERCASE.
- Tambah interface `ApiParent` yang sudah ada tapi belum digunakan.

#### [NEW] lib/mappers.ts
Helper mapper untuk konversi enum/data antara backend (UPPERCASE) dan UI (display string):
```ts
// Achievement type display
export function mapAchievementType(type: AchievementType): string
export function mapAchievementLevel(level: AchievementLevel): string

// Submission status display  
export function mapSubmissionStatus(status: SubmissionStatus): string
```

#### [MODIFY] store/authStore.ts
Tambah field `studentId: string | null` dan `parentId: string | null` ke dalam state. Setelah login sebagai STUDENT, panggil `/students` → cari student dengan `userId === user.id` → simpan `studentId`. Begitu pula untuk PARENT.

#### [MODIFY] components/layout/Sidebar.tsx
- Ganti `userName` hardcoded menjadi baca dari `useAuthStore` → `getDisplayName(user)`.
- Tambah tombol logout yang memanggil `useAuthStore().logout()` + redirect ke `/login`.

#### [MODIFY] components/layout/Topbar.tsx
- Ganti `userName` hardcoded menjadi terima dari parent melalui store, atau baca sendiri dari `useAuthStore`.

#### [MODIFY] app/student/layout.tsx
- Baca `user` dari `useAuthStore` → pass `userName={getDisplayName(user)}` ke `<Sidebar>`.

#### [MODIFY] app/admin/layout.tsx
- Baca `user` dari `useAuthStore` → pass `userName={getDisplayName(user)}` ke `<Sidebar>`.

#### [NEW/MODIFY] app/parent/layout.tsx *(saat ini tidak ada, tiap halaman parent punya layout sendiri)*
- Buat shared parent layout dengan `Sidebar` + `ParentProvider`.
- Baca `user` dari `useAuthStore` → pass `userName={getDisplayName(user)}` ke `<Sidebar>`.
- Hapus `<Sidebar>` lokal dari masing-masing halaman parent.

---

### Phase 2 — Auth (Login & Register)

#### [MODIFY] app/register/page.tsx
- Sambungkan form ke `authService.register()`.
- Kirim payload `{ firstName, lastName, email, password, role }` ke API.
- Setelah sukses: auto-login dan redirect ke dashboard sesuai role (sama seperti login page).
- Tampilkan error dari response API jika gagal.
- Hilangkan teks "Jejak" yang salah (harusnya "Askala").

---

### Phase 3 — Halaman Siswa

#### [MODIFY] app/student/achievements/page.tsx
- **Fix `studentId`**: Baca `studentId` dari `useAuthStore` state (yang sudah di-resolve di Phase 1).
- Hapus field `studentId: selected?.studentId ?? ""` yang salah — ganti dengan `studentId` dari store.

#### [MODIFY] app/student/portfolio/page.tsx
- **Replace mock data** dengan panggilan API:
  - `achievementService.getAll()` untuk prestasi
  - `orgService.getAll()` untuk organisasi (note: backend `/organizations` adalah master data, bukan per-siswa. Untuk organisasi per-siswa kita gunakan data `student.extracurriculars` dari `studentService.getById(studentId)`)
- Tambah `useEffect` + loading state.
- Sambungkan form add/edit/delete ke service calls yang sesuai.
- Profil portofolio baca dari `user` di authStore + `studentService.getById`.

#### [MODIFY] app/student/organizations/page.tsx
- Karena backend tidak memiliki endpoint "StudentOrg" per siswa secara terpisah (endpoint `/organizations` adalah master org), halaman ini akan menampilkan master organizations dari `orgService.getAll()` (data org yang ada di sekolah).
- CRUD akan memanggil `orgService.create/update/remove`.
- Untuk eskul: simpan via `studentService.update(studentId, { extracurriculars: [...] })`.

#### [MODIFY] app/student/page.tsx (Dashboard)
- Fetch data nyata dari:
  - `achievementService.getAll()` → count prestasi
  - `billService.getAll()` → count tagihan pending
  - `submissionService.getAll()` → total sudah bayar
  - `orgService.getAll()` → count organisasi
- Tampilkan summary stats dan recent activities dari data real.
- Hapus semua import dari `mockData`.

---

### Phase 4 — Halaman Admin

#### [MODIFY] app/admin/students/page.tsx
- Replace `mockStudents` dengan `studentService.getAll()`.
- CRUD siswa via `studentService.create/update/remove`.
- Tambah `useEffect` + loading state.
- Gunakan tipe `ApiStudent` alih-alih `Student`.

#### [MODIFY] app/admin/payments/page.tsx
- Replace `mockPayments` dengan `submissionService.getAll()`.
- Tambah tombol verify → `submissionService.update(id, { status: "VERIFIED" })`.
- Tambah tombol reject → `submissionService.update(id, { status: "REJECTED", note: ... })`.
- Gunakan tipe `ApiSubmission`.

#### [MODIFY] app/admin/treasury/page.tsx
- Backend API saat ini fokus pada Bills dan Submissions. Tidak ada endpoint `/transactions`.
- Halaman treasury akan menampilkan data bills (`billService.getAll()`) dan organisasi (`orgService.getAll()`).
- CRUD bills via `billService.create/update/remove`.
- Chart tetap dengan data dari bills yang digroup per bulan.

#### [MODIFY] app/admin/activities/page.tsx
- Backend tidak memiliki endpoint activities/kegiatan.
- Halaman ini akan tetap functional tapi dengan empty state yang informatif.
- Data yang bisa ditampilkan: daftar submissions terbaru atau list bills aktif.
- **Alternatif**: Tampilkan halaman "coming soon" atau gunakan bills sebagai proxy untuk aktivitas keuangan.

#### [MODIFY] app/admin/page.tsx (Dashboard Admin)
- Fetch stats nyata dari API:
  - `studentService.getAll()` → jumlah siswa
  - `submissionService.getAll()` → pending verifikasi
  - `billService.getAll()` → total tagihan
  - `orgService.getAll()` → jumlah organisasi

---

### Phase 5 — Halaman Orang Tua

> **Note**: Fitur parent bergantung pada konsep "anak dari orang tua" (relasi Parent → Student). Backend memiliki `ApiParent.students[]`. Setelah login sebagai PARENT, kita perlu mengambil data parent + student-nya.

#### [NEW] services/parent.service.ts
```ts
export const parentService = {
  async getMe(): Promise<ApiParent>  // GET /parents/me atau /parents?userId=...
  async getById(id: string): Promise<ApiParent>
}
```
*(Bergantung pada endpoint yang tersedia di backend — perlu diverifikasi)*

#### [MODIFY] app/parent/page.tsx
- Fetch data anak dari `parentService.getMe()` → ambil `students[0]` sebagai anak pertama.
- Fetch prestasi & pembayaran anak dari API.
- Ganti nama hardcoded "Ahmad Rizky" / "Ibu Kartini" dengan data dari store.

#### [MODIFY] app/parent/payments/page.tsx
- Fetch submissions dari `submissionService.getAll()` (filter berdasarkan studentId anak).
- Gunakan tipe `ApiSubmission`.

#### [MODIFY] app/parent/activities/page.tsx
- Fetch prestasi anak dari `achievementService.getAll()`.
- Fetch organisasi dari `orgService.getAll()`.
- Ganti nama hardcoded dengan data dinamis.

---

### Phase 6 — Pembersihan

#### [MODIFY] lib/mockData.ts
- Hapus semua data mock yang sudah tidak terpakai.
- Atau pertahankan file tapi kosongkan isinya (agar tidak ada import error sementara).

---

## Open Questions

> [!IMPORTANT]
> **Backend endpoint untuk parent?**
> Apakah tersedia endpoint `GET /parents/me` atau `GET /parents?userId=X` untuk mendapatkan profil parent beserta daftar anaknya? Ini kritis untuk halaman orang tua.

> [!IMPORTANT]
> **Backend resolve studentId dari JWT?**
> Apakah endpoint `POST /achievements` dan `POST /submissions` bisa menerima request tanpa `studentId` di body (karena backend resolve dari JWT token)? Atau wajib dikirim?

> [!WARNING]
> **Endpoint `/activities` dan `/transactions`?**
> Backend API yang ter-dokumentasi hanya punya: `/auth`, `/students`, `/achievements`, `/organizations`, `/bills`, `/submissions`. Tidak ada `/activities` maupun `/transactions`.
> Halaman `admin/activities` dan `admin/treasury` (bagian transactions) tidak bisa di-connect ke API real karena endpoint-nya tidak exist.
> Solusi: tampilkan data seadanya (bills sebagai tagihan, dll) atau beri tanda "fitur dalam pengembangan".

> [!NOTE]
> **Konfirmasi enum format**
> Enum backend sudah UPPERCASE (`AKADEMIK`, `SEKOLAH`, dll). Frontend sudah sesuai di achievements page. Perlu mapper untuk display label di UI.

## Verification Plan

### Automated (Build Check)
```bash
npm run build
```

### Manual Testing
1. **Login** → cek nama user muncul di Sidebar/Topbar
2. **Register** → cek akun baru terbuat di backend
3. **Achievements** → add/edit/delete → cek data persist ke API
4. **Payments** → upload bukti → cek submission terbuat
5. **Admin payments** → verify/reject submission → cek status berubah
6. **Admin students** → list siswa dari API → tidak ada mock data
