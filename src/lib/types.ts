// ─── Shared Types for Askala Admin Panel ──────────────────────

// ─── Portfolio – Achievement ───────────────────────────────────
export type AchievementCategory = "Akademik" | "Non-Akademik" | "Organisasi" | "Olahraga" | "Seni";
export type AchievementLevel    = "Sekolah" | "Kabupaten/Kota" | "Provinsi" | "Nasional" | "Internasional";

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  category: AchievementCategory;
  level: AchievementLevel;
  position: string;          // e.g. "Juara 1", "Peserta Terbaik"
  organizer: string;         // penyelenggara
  date: string;
  certificateUrl?: string;   // URL file sertifikat
  createdAt: string;
}

// ─── Portfolio – Student Organization Membership ───────────────
export interface StudentOrg {
  id: string;
  studentId: string;
  orgName: string;           // nama organisasi
  role: string;              // jabatan: Ketua / Anggota / Sekretaris
  since: string;             // mulai bergabung
  until?: string;            // hingga (null = masih aktif)
  isActive: boolean;
  description?: string;
  createdAt: string;
}

// ─── Portfolio – Extracurricular ──────────────────────────────
export interface Extracurricular {
  id: string;
  studentId: string;
  name: string;
  coach?: string;
  role: string;
  since: string;
  until?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Portfolio aggregate (for admin read-only view) ───────────
export interface StudentPortfolio {
  studentId: string;
  achievements: Achievement[];
  organizations: StudentOrg[];
  extracurriculars: Extracurricular[];
}

export type Role = "admin" | "student" | "parent";

export type PaymentStatus = "pending" | "verified" | "rejected";
export type ActivityStatus = "upcoming" | "ongoing" | "done";
export type TransactionType = "in" | "out";
export type StudentStatus = "active" | "inactive";

// ─── Student ──────────────────────────────────────────────────
export interface Student {
  id: string;
  nis: string;
  name: string;
  email: string;
  phone: string;
  kelas: string;
  jurusan: string;
  status: StudentStatus;
  organizationCount: number;
  organizations: string[];
  joinDate: string;
  address?: string;
}

// ─── Payment ──────────────────────────────────────────────────
export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  kelas: string;
  tagihan: string;
  organization: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  buktiUrl?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

// ─── Treasury ─────────────────────────────────────────────────
export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  organization: string;
  amount: number;
  date: string;
  recordedBy: string;
  notes?: string;
}

// ─── Activity ─────────────────────────────────────────────────
export interface Activity {
  id: string;
  name: string;
  organization: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  status: ActivityStatus;
  participants: number;
  maxParticipants: number;
  coordinator: string;
  budget?: number;
}

// ─── Organization ─────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  shortName: string;
  description: string;
  memberCount: number;
  balance: number;
  coordinator: string;
  since: string;
}

// ─── Admin Settings ───────────────────────────────────────────
export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  jabatan: string;
  nip: string;
  avatar?: string;
}

export interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  tahunAjaran: string;
  kepalaSekolah: string;
  npsn: string;
}

export interface NotificationSettings {
  emailVerifikasi: boolean;
  emailPembayaran: boolean;
  emailKegiatan: boolean;
  pushNotif: boolean;
  weeklyReport: boolean;
}
