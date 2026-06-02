// ─── Shared Types for Askala — aligned with backend API ───────────

// Backend enums
export type Role = "ADMIN" | "STUDENT" | "PARENT";
export type AchievementType = "AKADEMIK" | "ORGANISASI" | "NON_AKADEMIK";
export type AchievementLevel =
  | "SEKOLAH"
  | "KABUPATEN"
  | "PROVINSI"
  | "NASIONAL"
  | "INTERNASIONAL";
export type SubmissionStatus = "PENDING" | "VERIFIED" | "REJECTED";

// ─── Frontend display helpers (mapped from backend enums) ──────
export type AchievementCategory = "Akademik" | "Non-Akademik" | "Organisasi" | "Olahraga" | "Seni";
export type PaymentStatus = "pending" | "verified" | "rejected";
export type ActivityStatus = "upcoming" | "ongoing" | "done";
export type TransactionType = "in" | "out";
export type StudentStatus = "active" | "inactive";

// ─── Backend: User ────────────────────────────────────────────
export interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend: Student ─────────────────────────────────────────
export interface ApiStudent {
  id: string;            // UUID
  nis: string;
  kelas: string;
  jurusan?: string;
  address?: string;
  parentId?: string;
  userId: number;
  user: ApiUser;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend: Achievement ─────────────────────────────────────
export interface ApiAchievement {
  id: string;            // UUID
  studentId: string;
  title: string;
  description?: string;
  type: AchievementType;
  level: AchievementLevel;
  position: string;
  organizer: string;
  date: string;          // ISO date string
  certificateUrl?: string;
  isVerified: boolean;
  student?: ApiStudent;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend: Organization ────────────────────────────────────
export interface ApiOrganization {
  id: string;            // UUID
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend: Bill (Tagihan) ──────────────────────────────────
export interface ApiBill {
  id: string;            // UUID
  title: string;
  amount: number;        // IDR integer
  dueDate?: string;      // ISO date string
  orgId?: string;
  organization?: ApiOrganization;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend: Submission (Bukti Bayar) ────────────────────────
export interface ApiSubmission {
  id: string;            // UUID
  billId: string;
  studentId: string;
  fileUrl: string;
  note?: string;
  status: SubmissionStatus;
  verifiedBy?: string;   // numeric user ID as string
  verifiedAt?: string;
  bill?: ApiBill;
  student?: ApiStudent;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend: Parent ──────────────────────────────────────────
export interface ApiParent {
  id: string;            // UUID
  userId: number;
  user: ApiUser;
  students?: ApiStudent[];
  createdAt: string;
  updatedAt: string;
}

// ─── Auth responses ───────────────────────────────────────────
export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: Role;
}

// ─── Legacy frontend types kept for UI compatibility ──────────

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  category: AchievementCategory;
  level: string;
  position: string;
  organizer: string;
  date: string;
  certificateUrl?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface StudentOrg {
  id: string;
  studentId: string;
  orgName: string;
  role: string;
  since: string;
  until?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

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

export interface StudentPortfolio {
  studentId: string;
  achievements: Achievement[];
  organizations: StudentOrg[];
  extracurriculars: Extracurricular[];
}

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
