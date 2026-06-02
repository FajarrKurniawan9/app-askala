/**
 * Mappers — konversi enum antara format backend (UPPERCASE) dan label UI (Bahasa Indonesia).
 */
import type { AchievementType, AchievementLevel, SubmissionStatus } from "@/lib/types";

export function mapAchievementType(type: AchievementType): string {
  const map: Record<AchievementType, string> = {
    AKADEMIK:    "Akademik",
    ORGANISASI:  "Organisasi",
    NON_AKADEMIK: "Non-Akademik",
  };
  return map[type] ?? type;
}

export function mapAchievementLevel(level: AchievementLevel): string {
  const map: Record<AchievementLevel, string> = {
    SEKOLAH:       "Sekolah",
    KABUPATEN:     "Kabupaten/Kota",
    PROVINSI:      "Provinsi",
    NASIONAL:      "Nasional",
    INTERNASIONAL: "Internasional",
  };
  return map[level] ?? level;
}

export function mapSubmissionStatus(status: SubmissionStatus): string {
  const map: Record<SubmissionStatus, string> = {
    PENDING:  "Menunggu",
    VERIFIED: "Terverifikasi",
    REJECTED: "Ditolak",
  };
  return map[status] ?? status;
}
