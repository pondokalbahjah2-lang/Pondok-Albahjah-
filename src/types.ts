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
  webAuthnCredentialId?: string;
  passwordLastUpdated?: string;
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
  timePulang?: string; // HH:mm
  photoUrl: string;
  photoPulangUrl?: string;
  latitude: number;
  longitude: number;
  distanceFromPondok: number; // in meters
  status: 'Hadir' | 'Terlambat' | 'Sakit' | 'Libur';
  isWithinRadius: boolean;
  notes?: string;
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
  status: 'Di Luar' | 'Kembali Tepat Waktu' | 'Terlambat' | 'Menunggu Persetujuan';
  keteranganKeterlambatan?: string; // e.g. "1 Jam 15 Menit"
  approvedBy?: string;
  approvedAt?: string;
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
  targetType: 'Divisi' | 'Individu';
  targetId: string; // SubDivisi name or Pejuang ID
  targetName: string;
  jamMasuk: string; // e.g. "07:00"
  jamPulang: string; // e.g. "16:00"
  hariKerja: string[]; // e.g. ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
}

export interface AppNotification {
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
