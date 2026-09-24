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
  bankName?: string;
  nomorRekening?: string;
  namaRekening?: string;
  assignedShiftId?: string;
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
  shiftId?: string;
  namaShift?: string;
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
  hariKerja: string[]; // e.g. ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"]
  isNightShift?: boolean; // Shift malam atau lintas hari
  customJamKerja?: Record<string, { masuk: string, pulang: string; isNightShift?: boolean }>;
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
  liburPengurusApprovers?: string[];
  jenisCutiList?: { id: string; name: string; maxDays: number; }[];
  broadcastMessage?: string;
}

export interface DivisiShiftConfig {
  id: string;
  namaShift: string; // e.g. "Shift 1 (Pagi)" / "Shift 2 (Siang/Sore)"
  jamMasuk: string; // "07:00"
  jamPulang: string; // "15:00"
  toleransiMenit?: number;
  hariKerja?: string[];
  isNightShift?: boolean;
}

export interface DivisiRecord {
  id: string;
  namaDivisi: string;
  deskripsi?: string;
  warnaLabel?: string;
  iconName?: string;
  anggotaIds: string[]; // referensi ke UserAccount.id
  hasTwoShifts?: boolean;
  shifts?: DivisiShiftConfig[];
  createdAt: string;
  updatedAt?: string;
}

export const SUB_DIVISI_LIBUR_PENGURUS = [
  'Pondok Pesantren Unit SDIQu',
  'Pondok Pesantren Unit SMPIQu',
  'Pondok Pesantren Unit SMAIQu',
  'Kepondokan Banat'
] as const;

export interface LiburPengurusRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  amanah: string;
  subDivisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalHari: number;
  alasan?: string;
  badalId: string;
  badalName: string;
  badalAmanah: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Sedang Libur' | 'Selesai';
  tanggalPengajuan: string;
  approvedBy?: string;
  approvedAt?: string;
  catatanAdmin?: string;
  suratUrl?: string;
  history?: { status: string; by: string; timestamp: string }[];
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

// ==========================================
// MODUL ABSENSI & JADWAL MENGAJAR (JP)
// ==========================================

export interface TeachingLocation {
  id: string;
  nama?: string;
  name?: string;
  latitude: number;
  longitude: number;
  radiusMeter?: number;
  radiusMeters?: number;
  maxAccuracyMeters?: number;
  unit?: string; // e.g. "SMAIQu", "SMPIQu", "SDIQu"
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeachingClass {
  id: string;
  namaKelas?: string; // e.g. "X MIPA 1", "7A Putri"
  name?: string;
  tingkat?: string; // e.g. "10", "7"
  gradeLevel?: string;
  description?: string;
  unit?: string; // e.g. "SMAIQu", "SMPIQu"
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeachingSchedule {
  id: string;
  unit: string; // e.g. "SMAIQu"
  pejuangId: string; // ID Pengajar
  pejuangName: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad';
  jamMulai: string; // "07:30"
  jamSelesai: string; // "09:00"
  classId: string;
  className: string;
  mapel?: string;
  subject?: string;
  jumlahJP: number; // e.g. 2, 3
  locationId: string;
  locationName: string;
  isActive?: boolean;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TeachingAttendanceStatus = 
  | 'Hadir' 
  | 'Terlambat' 
  | 'Alpa' 
  | 'Izin' 
  | 'Sakit' 
  | 'Lupa Absen Pulang';

export interface TeachingAttendance {
  id: string; // Format: `${scheduleId}_${date}`
  scheduleId: string;
  date: string; // YYYY-MM-DD
  pejuangId: string; // ID pejuang yang hadir (bisa substitute jika badal)
  pejuangName: string;
  actualPejuangId?: string;
  actualPejuangName?: string;
  scheduledPejuangId?: string; // ID pengajar sesuai jadwal asli
  scheduledPejuangName?: string;
  isBadal: boolean;
  badalSubstitutionId?: string;
  unit: string;
  classId: string;
  className: string;
  mapel?: string;
  subject?: string;
  jumlahJP: number;
  actualJP?: number;
  jadwalMulai?: string;
  jadwalSelesai?: string;
  jamMasuk?: string; // "07:32"
  jamPulang?: string; // "09:02"
  status: TeachingAttendanceStatus;
  lateMinutes?: number; // 0 jika tepat waktu
  durationMinutes?: number;
  masukLat?: number;
  masukLng?: number;
  masukDistanceMeters?: number;
  pulangLat?: number;
  pulangLng?: number;
  pulangDistanceMeters?: number;
  notes?: string;
  source?: 'GPS' | 'Koreksi Admin' | 'Manual' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeachingSubstitution {
  id: string;
  scheduleId: string;
  date: string; // YYYY-MM-DD
  unit: string;
  originalPejuangId: string;
  originalPejuangName: string;
  substitutePejuangId: string;
  substitutePejuangName: string;
  mapel?: string;
  subject?: string;
  className: string;
  jamMulai: string;
  jamSelesai: string;
  jumlahJP: number;
  alasan: string;
  reason?: string;
  requestedBy?: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Dibatalkan';
  approvedBy?: string;
  decidedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TeachingSettings {
  toleranceLateMinutes: number; // default 10
  toleransiTerlambatMenit?: number;
  lockPulangEarlyMinutes: number; // default 5 (tidak boleh pulang sebelum jamSelesai - 5 menit)
  maxLateToleranceMinutes: number; // default 60
  cutOffDay: number; // default 26 (periode cut off 26 s/d 25)
  allowedUnits: string[];
  masukBukaMenit?: number;
  pulangBukaMenit?: number;
  cutoffStartDay?: number;
  cutoffEndDay?: number;
}

export interface TeachingReportItem {
  pejuangId: string;
  pejuangName: string;
  nipy?: string;
  unit: string;
  namaBank?: string;
  noRekening?: string;
  totalScheduledSessions: number;
  totalPresentSessions: number;
  totalLateSessions: number;
  totalAbsentSessions: number;
  totalPermitSessions: number;
  totalLateMinutes: number;
  totalTeachingMinutes: number;
  totalJP: number;
  substitutionsGiven: number;
  substitutionsReceived: number;
  attendanceRate: number;
  dailyJP?: Record<string, number>;
  totalSesiTerjadwal?: number;
  totalJPTerjadwal?: number;
  totalJPHadir?: number;
  totalJPTerlambat?: number;
  totalJPBadal?: number;
  totalJPNetto?: number;
}

export interface TeachingReportSummary {
  startDate: string;
  endDate: string;
  dates: string[];
  unit: string;
  teacherSummaries: TeachingReportItem[];
  detailRecords: any[];
  totalSessions: number;
  totalJP: number;
  totalLateMinutes: number;
  totalSesiTerjadwal?: number;
  totalJPTerjadwal?: number;
  totalJPHadir?: number;
  totalJPTerlambat?: number;
  totalJPBadal?: number;
  totalJPNetto?: number;
}

export interface TeachingSessionItem {
  schedule: TeachingSchedule;
  date: string; // YYYY-MM-DD
  hari: string;
  isToday: boolean;
  isPast: boolean;
  effectivePejuangId: string;
  effectivePejuangName: string;
  isBadal: boolean;
  substitution?: TeachingSubstitution;
  attendance?: TeachingAttendance;
  computedStatus: TeachingAttendanceStatus | 'Terjadwal' | 'Libur' | 'Dibadalkan' | 'Belum Waktunya';
  canAbsenMasuk: boolean;
  canAbsenPulang: boolean;
  reasonDisabledMasuk?: string;
  reasonDisabledPulang?: string;
}

export interface JPPengajarSummary {
  no: number;
  pejuangId: string;
  pejuangName: string;
  mapel: string;
  unit: string;
  dailyJP: Record<string, number>; // dateString -> JP count
  totalJP: number;
}

export interface AttendanceRekapItem {
  pejuangId: string;
  pejuangName: string;
  unit: string;
  totalSesiTerjadwal: number;
  hadir: number;
  terlambat: number;
  alpa: number;
  izinSakit: number;
  totalMenitTerlambat: number;
  totalJamMengajar: number; // Jam desimal atau jam riil
  totalJP: number;
  badalDiberikan: number;
  badalDiterima: number;
  persenKehadiran: number;
}

export interface TeachingSessionDetailItem {
  tanggal: string;
  hari: string;
  unit: string;
  pengajar: string;
  kelas: string;
  mapel: string;
  jp: number;
  lokasi: string;
  jadwalMulaiSelesai: string;
  jamMasuk: string;
  jamPulang: string;
  durasi: string;
  status: string;
  terlambatMenit: number;
  jarakMasukMeter: number | string;
  badal: 'Ya' | 'Tidak';
  pengajarAsli: string;
  catatan: string;
}

export interface TeachingBadalRekapItem {
  tanggal: string;
  unit: string;
  kelas: string;
  mapel: string;
  jp: number;
  jadwal: string;
  pengajarAsli: string;
  pengajarPengganti: string;
  alasan: string;
  status: string;
  disetujuiOleh: string;
}

