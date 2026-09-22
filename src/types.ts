export type Role = 'Admin' | 'Pejuang';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string; // ISO string
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  subDivisi: string;
  amanah: string;
  nipy?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  pushNotificationsEnabled?: boolean;
  vibrationFeedbackEnabled?: boolean;
  webAuthnCredentialId?: string;
  passwordLastUpdated?: string;
  suratKeputusanUrl?: string;
  pkwtStart?: string;
  pkwtEnd?: string;
  isPengajar?: boolean;
  namaBank?: string;
  noRekening?: string;
}

export interface ManhajiyyahClause {
  id: string;
  bab: string;
  pasalNumber: string; // Changed to string to allow e.g. "1", "1A" or just keep as string for flexibility
  title: string;
  category: string;
  content: string;
}

export interface AttendanceRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  subDivisi: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timeMasuk?: string; // HH:mm
  timePulang?: string; // HH:mm
  photoUrl: string;
  photoUrlMasuk?: string;
  photoPulangUrl?: string;
  latitude: number;
  longitude: number;
  distanceFromPondok: number; // in meters
  status: 'Hadir' | 'Terlambat' | 'Sakit' | 'Libur' | 'Izin' | 'Izin Tidak Masuk' | 'Cuti';
  isWithinRadius: boolean;
  notes?: string;
  suratSakitUrl?: string;
  lat?: number;
  lng?: number;
  timestamp?: string;
}

export interface ExitPermissionRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  subDivisi: string;
  alasan: string;
  tanggalKeluar: string;
  tanggalIzinSampai: string;
  tanggalKembaliReal?: string;
  jamKeluar: string;
  jamHarusKembali: string;
  jamKembaliReal?: string;
  status: 'Di Luar' | 'Kembali Tepat Waktu' | 'Terlambat' | 'Menunggu Persetujuan' | 'Ditolak' | 'Pending' | 'Disetujui';
  keteranganKeterlambatan?: string; // e.g. "1 Jam 15 Menit"
  approvedBy?: string;
  approvedAt?: string;
  history?: { status: string, by: string, timestamp: string }[];
}

export interface LeaveRequestRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  nipy: string;
  subDivisi: string;
  jenisCuti: string;
  alasan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalHari: number;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Sedang Cuti' | 'Selesai';
  tanggalPengajuan: string;
  catatanAdmin?: string;
  approvedBy?: string;
  approvedAt?: string;
  history?: { status: string, by: string, timestamp: string }[];
}

export interface WarningLetterRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  subDivisi: string;
  type: 'Surat Teguran' | 'SP 1' | 'SP 2' | 'SP 3';
  tanggal: string;
  alasan: string;
  fileUrl?: string;
  fileName?: string;
  createdAt?: string;
  date?: string;
  warningLevel?: string;
  reason?: string;
}

export interface SlipUbarRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  periode: string; // e.g. "Agustus 2026"
  tanggalUpload: string;
  fileName: string;
  fileUrl: string;
  filePassword?: string;
}

export interface WorkSchedule {
  id: string;
  targetType: 'Divisi' | 'Individu' | 'Group';
  targetId: string; // SubDivisi name or Pejuang ID or "Group"
  targetName: string;
  jamMasuk: string; // e.g. "07:00"
  jamPulang: string; // e.g. "16:00"
  hariKerja: string[]; // e.g. ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  customJamKerja?: Record<string, { masuk: string, pulang: string }>;
  pejuangIds?: string[];
  divisiIds?: string[];
  tanggalLibur?: string[];
}

export interface AppNotification {
  userId?: string;
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface GeneralSettings {
  appLogoUrl?: string;
  appName?: string;
  suratIzinTemplateUrl?: string;
  suratCutiTemplateUrl?: string;
  kepalaPondokName?: string;
  autoThemeBasedOnSun?: boolean;
  izinKeluarApprovers?: string[];
  cutiApprovers?: string[];
  jenisCutiList?: { id: string; name: string; maxDays: number; }[];
  broadcastMessage?: string;
}

export interface LocationSettings {
  latitude: number;
  longitude: number;
  radiusMaxMeters: number;
  addressName: string;
}

export interface HijriDate {
  day: number;
  monthName: string;
  monthNumber: number;
  year: number;
  formatted: string;
}

export interface KajianRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  subDivisi: string;
  date: string; // The date the Kajian was attended
  kajianName: string;
  mode: 'Offline' | 'Online';
  latitude?: number;
  longitude?: number;
  isWithinRadius?: boolean;
  attendancePhotoUrl?: string; // Gdrive Link
  notesPhotoUrl?: string; // Gdrive Link
  statusValidasi?: 'Valid' | 'Ditolak';
}

export interface HolidayRecord {
  id: string;
  tanggal: string;
  keterangan: string;
}

export interface TeachingLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // default 100
  maxAccuracyMeters: number; // default 50
  isActive: boolean;
}

export interface TeachingClass {
  id: string;
  name: string; // mis. "XI IPA 1"
  unit: string; // subDivisi, mis. "SMAIQu"
  level?: string;
  gradeLevel?: string;
  description?: string;
  notes?: string;
  isActive: boolean;
}

export interface TeachingScheduleTolerance {
  masukBukaMenit?: number;
  toleransiTerlambatMenit?: number;
  pulangBukaMenit?: number;
  pulangTutupMenit?: number;
  radiusMeters?: number;
  maxAccuracyMeters?: number;
}

export interface TeachingSchedule {
  id: string;
  pejuangId: string;
  pejuangName: string;
  unit: string;
  classId: string;
  className: string;
  subject: string; // MAPEL
  jumlahJP: number; // integer >= 1
  hari: string[]; // ["Senin", "Selasa", ...]
  jamMulai: string; // "07:30"
  jamSelesai: string; // "09:00"
  locationId: string;
  locationName: string;
  berlakuMulai: string; // YYYY-MM-DD
  berlakuSampai?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  tolerance?: TeachingScheduleTolerance;
  isActive: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface TeachingSettings {
  masukBukaMenit: number; // default 15
  toleransiTerlambatMenit: number; // default 5
  pulangBukaMenit: number; // default 10
  pulangTutupMenit: number; // default 60
  menitPerJP: number; // default 45
  cutoffHari: number; // default 25
  cutoffStartDay?: number;
  cutoffEndDay?: number;
  hitungJPLupaPulang: boolean; // default true
  defaultRadiusMeters: number; // default 100
  defaultMaxAccuracyMeters: number; // default 50
  tanggalLibur: string[]; // ["2026-08-17", ...]
}

export type TeachingSubstitutionStatus = 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Dibatalkan';

export interface TeachingSubstitution {
  id: string; // `${scheduleId}_${date}`
  scheduleId: string;
  date: string; // YYYY-MM-DD
  originalPejuangId: string;
  originalPejuangName: string;
  substitutePejuangId: string;
  substitutePejuangName: string;
  unit: string;
  classId: string;
  className: string;
  subject: string;
  jumlahJP: number;
  jamMulai: string;
  jamSelesai: string;
  reason: string;
  requestedBy: 'Admin' | 'Pejuang';
  requestedById: string;
  status: TeachingSubstitutionStatus;
  decidedBy?: string;
  decidedAt?: string;
  adminNote?: string;
  createdAt: string;
}

export type TeachingAttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';
export type TeachingPulangFlag = 'Normal' | 'Pulang Cepat' | 'Lupa Absen Pulang';

export interface TeachingGPSPoint {
  lat: number;
  lng: number;
  accuracy: number;
  distanceMeters: number;
  isWithinRadius: boolean;
}

export interface TeachingAttendance {
  id: string; // `${scheduleId}_${date}`
  scheduleId: string;
  date: string; // YYYY-MM-DD
  hari: string;
  pejuangId: string; // yang benar-benar mengajar
  pejuangName: string;
  scheduledPejuangId: string; // pengajar asli
  scheduledPejuangName: string;
  isBadal: boolean;
  substitutionId?: string;
  unit: string;
  classId: string;
  className: string;
  subject: string;
  jumlahJP: number;
  locationId: string;
  locationName: string;
  jadwalMulai: string;
  jadwalSelesai: string;
  jamMasuk?: string; // HH:mm
  jamPulang?: string; // HH:mm
  masuk?: TeachingGPSPoint;
  pulang?: TeachingGPSPoint;
  status: TeachingAttendanceStatus;
  lateMinutes: number;
  durationMinutes: number;
  pulangFlag?: TeachingPulangFlag;
  actualPejuangId?: string;
  actualPejuangName?: string;
  actualJP?: number;
  source: 'GPS' | 'Koreksi Admin';
  notes?: string;
  editedBy?: string;
  createdAt?: any;
}

export interface TeachingTeacherSummary {
  pejuangId: string;
  pejuangName: string;
  nipy: string;
  unit: string;
  namaBank: string;
  noRekening: string;
  totalSesiTerjadwal: number;
  totalJPTerjadwal: number;
  totalJPHadir: number;
  totalJPTerlambat: number;
  totalJPBadal: number;
  totalJPNetto: number;
}

export interface TeachingReportItem {
  id: string;
  date: string;
  unit: string;
  className: string;
  subject: string;
  pejuangId: string;
  pejuangName: string;
  actualPejuangId: string;
  actualPejuangName: string;
  jamMasuk?: string;
  jamPulang?: string;
  jumlahJP: number;
  actualJP?: number;
  status: string;
  isBadal: boolean;
  source?: string;
}

export interface TeachingReportSummary {
  startDate: string;
  endDate: string;
  totalSesiTerjadwal: number;
  totalJPTerjadwal: number;
  totalJPHadir: number;
  totalJPTerlambat: number;
  totalJPBadal: number;
  totalJPNetto: number;
  teacherSummaries: TeachingTeacherSummary[];
  detailRecords: TeachingReportItem[];
}


