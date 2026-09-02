import { DownloadCloud } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  MapPin,
  Clock,
  Users,
  BookOpen,
  Plus,
  Save,
  Trash2,
  Edit,
  Key,
  ShieldCheck,
  CheckCircle,
  Camera,
  User,
  Upload,
  Sun,
  Moon,
  Monitor,
  Bell,
  FileText,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  UserAccount,
  LocationSettings,
  WorkSchedule,
  ManhajiyyahClause,
  AttendanceRecord,
} from '../types';
import { Storage as AppStorage } from '../utils/storage';
import { secondaryAuth, auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

interface SettingsViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  locationSettings: LocationSettings;
  schedules: WorkSchedule[];
  manhajiyyahClauses: ManhajiyyahClause[];
  attendance?: AttendanceRecord[];
  onSaveLocationSettings: (settings: LocationSettings) => void;
  onSaveSchedules: (schedules: WorkSchedule[]) => void;
  onSaveAccounts: (accounts: UserAccount[]) => void;
  onSaveManhajiyyahClauses: (clauses: ManhajiyyahClause[]) => void;
  appLogoUrl?: string;
  suratIzinTemplateUrl?: string;
  suratCutiTemplateUrl?: string;
  kepalaPondokName?: string;
  izinKeluarApprovers?: string[];
  cutiApprovers?: string[];
  jenisCutiList?: { id: string; name: string; maxDays: number; }[];
  onSaveGeneralSettings?: (gen: { 
    appLogoUrl?: string,
    broadcastMessage?: string, 
    suratIzinTemplateUrl?: string, 
    suratCutiTemplateUrl?: string,
    kepalaPondokName?: string, 
    izinKeluarApprovers?: string[],
    cutiApprovers?: string[],
    jenisCutiList?: { id: string; name: string; maxDays: number; }[]
  }) => void;
  onDeleteAttendanceByMonth?: (month: string) => Promise<void>;
}

import { LocationMap } from './LocationMap';

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  accounts,
  locationSettings,
  schedules,
  manhajiyyahClauses,
  attendance = [],
  onSaveLocationSettings,
  onSaveSchedules,
  onSaveAccounts,
  onSaveManhajiyyahClauses,
  appLogoUrl,
  broadcastMessage,
  suratIzinTemplateUrl,
  suratCutiTemplateUrl,
  kepalaPondokName,
  izinKeluarApprovers = [],
  cutiApprovers = [],
  jenisCutiList = [],
  onSaveGeneralSettings,
  onDeleteAttendanceByMonth,
}) => {
  const [deleteMonth, setDeleteMonth] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const { theme, setTheme } = useTheme();
  const isAdmin = currentUser.role === 'Admin';

  // Manhajiyyah State
  const [showManhajiyyahModal, setShowManhajiyyahModal] = useState(false);
  const [editingManhajiyyahId, setEditingManhajiyyahId] = useState<string | null>(null);
  const [manBab, setManBab] = useState('');
  const [manPasalNumber, setManPasalNumber] = useState('');
  const [manTitle, setManTitle] = useState('');
  const [manCategory, setManCategory] = useState('');
  const [manContent, setManContent] = useState('');

  const [activeTab, setActiveTab] = useState<'profil' | 'lokasi' | 'jadwal' | 'pejuang' | 'manhajiah' | 'backup'>(isAdmin ? 'lokasi' : 'profil');

  // Profile settings states & Logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [broadcastMsgInput, setBroadcastMsgInput] = useState(broadcastMessage || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState(false);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        handleUpdateProfilePic(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfilePic = (dataUrl: string) => {
    const updatedAccount = { ...currentUser, avatarUrl: dataUrl };
    const newAccounts = accounts.map(a => a.id === currentUser.id ? updatedAccount : a);
    onSaveAccounts(newAccounts);
    AppStorage.saveLoggedUser(updatedAccount);
    window.location.reload();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('jpeg') && !file.type.includes('jpg') && !file.type.includes('png') && !file.type.includes('webp')) {
      alert('Format file harus JPG atau PNG.');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
          if (onSaveGeneralSettings) {
            onSaveGeneralSettings({ appLogoUrl: compressedDataUrl });
          }
          alert('Logo Pondok Pesantren Al-Bahjah berhasil diunggah dan disimpan ke Firestore!');
        }
        setIsUploadingLogo(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const templateInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('jpeg') && !file.type.includes('jpg') && !file.type.includes('png') && !file.type.includes('webp')) {
      alert('Format file harus JPG atau PNG.');
      return;
    }

    setIsUploadingTemplate(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Let's keep A5 ratio high-res enough for printing (approx 800-1200px width)
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (onSaveGeneralSettings) {
            onSaveGeneralSettings({ suratIzinTemplateUrl: compressedDataUrl });
          }
          alert('Template Surat Izin Keluar berhasil diunggah!');
        }
        setIsUploadingTemplate(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTemplate = () => {
    if (confirm('Apakah Anda ingin menghapus template surat izin?')) {
      if (onSaveGeneralSettings) {
        onSaveGeneralSettings({ suratIzinTemplateUrl: '' });
      }
      alert('Template berhasil dihapus.');
    }
  };

  const templateCutiInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingTemplateCuti, setIsUploadingTemplateCuti] = useState(false);

  const handleTemplateCutiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPG/PNG) yang diperbolehkan untuk template Cuti.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    setIsUploadingTemplateCuti(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        if (onSaveGeneralSettings) {
          onSaveGeneralSettings({ suratCutiTemplateUrl: dataUrl });
        }
        alert('Template Surat Cuti berhasil diunggah!');
        setIsUploadingTemplateCuti(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTemplateCuti = () => {
    if (confirm('Apakah Anda ingin menghapus template surat cuti?')) {
      if (onSaveGeneralSettings) {
        onSaveGeneralSettings({ suratCutiTemplateUrl: '' });
      }
      alert('Template Cuti berhasil dihapus.');
    }
  };

  const toggleApprover = (type: 'izin' | 'cuti', id: string) => {
    if (!onSaveGeneralSettings) return;
    const currentList = type === 'izin' ? [...izinKeluarApprovers] : [...cutiApprovers];
    const index = currentList.indexOf(id);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      if (currentList.length >= 9) {
        alert('Maksimal 9 pejuang dapat ditunjuk sebagai approver.');
        return;
      }
      currentList.push(id);
    }
    
    if (type === 'izin') {
      onSaveGeneralSettings({ izinKeluarApprovers: currentList });
    } else {
      onSaveGeneralSettings({ cutiApprovers: currentList });
    }
  };

  const handleRemoveLogo = () => {
    if (confirm('Apakah Anda ingin menghapus logo kustom dan kembali ke lambang default?')) {
      if (onSaveGeneralSettings) {
        onSaveGeneralSettings({ appLogoUrl: '' });
      }
      alert('Logo kustom berhasil dihapus.');
    }
  };

  const handleTogglePushNotifications = () => {
    const newVal = !currentUser.pushNotificationsEnabled;
    const updatedAccount = { ...currentUser, pushNotificationsEnabled: newVal };
    const newAccounts = accounts.map(a => a.id === currentUser.id ? updatedAccount : a);
    onSaveAccounts(newAccounts);
    AppStorage.saveLoggedUser(updatedAccount);
    alert(`Notifikasi Real-time telah ${newVal ? 'diaktifkan' : 'dinonaktifkan'}.`);
    // Optional reload to ensure sync
    window.location.reload();
  };

  // Location settings states
  const [lat, setLat] = useState(locationSettings.latitude);
  const [lng, setLng] = useState(locationSettings.longitude);
  const [radius, setRadius] = useState(locationSettings.radiusMaxMeters);
  const [address, setAddress] = useState(locationSettings.addressName);

  // New account form modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('User123');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Pejuang'>('Pejuang');
  const [newSubDivisi, setNewSubDivisi] = useState('SMPIQu');
  const [newAmanah, setNewAmanah] = useState('Musyrif SMPIQu');
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newNipy, setNewNipy] = useState('');
  const [pejuangSearchQuery, setPejuangSearchQuery] = useState('');
  const [pejuangCurrentPage, setPejuangCurrentPage] = useState(1);
  const pejuangItemsPerPage = 10;

  // Save location
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLocationSettings({
      latitude: Number(lat),
      longitude: Number(lng),
      radiusMaxMeters: Number(radius),
      addressName: address,
    });
    alert('Pengaturan Lokasi Pondok & Radius Presensi Berhasil Diperbarui!');
  };

  // Schedule management
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [schTargetType, setSchTargetType] = useState<'Divisi' | 'Individu'>('Divisi');
  const [schTargetName, setSchTargetName] = useState('');
  const [schSelectedDivisi, setSchSelectedDivisi] = useState('');
  const [schJamMasuk, setSchJamMasuk] = useState('04:30');
  const [schJamPulang, setSchJamPulang] = useState('16:00');
  const [schHariKerja, setSchHariKerja] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);

  const allDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const uniqueDivisions = Array.from(new Set(accounts.map(a => a.subDivisi))).filter(Boolean);


  const handleSaveManhajiyyah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const newClause: ManhajiyyahClause = {
      id: editingManhajiyyahId || `man-${Date.now()}`,
      bab: manBab,
      pasalNumber: manPasalNumber,
      title: manTitle,
      category: manCategory,
      content: manContent
    };
    
    let updated: ManhajiyyahClause[];
    if (editingManhajiyyahId) {
      updated = manhajiyyahClauses.map(c => c.id === editingManhajiyyahId ? newClause : c);
    } else {
      updated = [...manhajiyyahClauses, newClause];
    }
    
    onSaveManhajiyyahClauses(updated);
    setShowManhajiyyahModal(false);
    setEditingManhajiyyahId(null);
    setManBab('');
    setManPasalNumber('');
    setManTitle('');
    setManCategory('');
    setManContent('');
  };
  
  const handleDeleteManhajiyyah = (id: string) => {
    if (!window.confirm("Hapus pasal ini?")) return;
    const updated = manhajiyyahClauses.filter(c => c.id !== id);
    onSaveManhajiyyahClauses(updated);
  };

  const toggleHariKerja = (hari: string) => {
    setSchHariKerja(prev => 
      prev.includes(hari) ? prev.filter(h => h !== hari) : [...prev, hari]
    );
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTargetName = schTargetType === 'Divisi' ? (schSelectedDivisi || schTargetName || 'Semua Divisi') : schTargetName;
    if (!finalTargetName) {
      alert('Mohon pilih atau isi Divisi / Nama Pejuang target.');
      return;
    }
    const targetPejuang = schTargetType === 'Individu' ? accounts.find(a => a.name === finalTargetName) : undefined;
    
    const newSchedule: WorkSchedule = {
      id: `sch-${Date.now()}`,
      targetType: schTargetType,
      targetId: schTargetType === 'Individu' ? (targetPejuang?.id || finalTargetName) : finalTargetName,
      targetName: finalTargetName,
      jamMasuk: schJamMasuk,
      jamPulang: schJamPulang,
      hariKerja: schHariKerja
    };
    onSaveSchedules([...schedules, newSchedule]);
    setShowAddScheduleModal(false);
    alert(`Jadwal kerja untuk ${finalTargetName} berhasil ditambahkan dan disimpan!`);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Hapus jadwal ini?')) {
      onSaveSchedules(schedules.filter(s => s.id !== id));
    }
  };

  // Add new Pejuang Account
  
  const handleEditUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    if (!newUsername.trim() || !newName.trim()) {
      alert('Mohon lengkapi Username dan Nama Pejuang.');
      return;
    }

    const email = newEmail.trim() || `${newUsername.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@albahjah.or.id`;
    
    const updatedAccounts = accounts.map(a => {
      if (a.id === editingUserId) {
        return {
          ...a,
          username: newUsername.trim(),
          password: newPassword,
          name: newName.trim(),
          role: newRole,
          subDivisi: newSubDivisi,
          amanah: newAmanah,
          nipy: newNipy,
          email: email
        };
      }
      return a;
    });

    onSaveAccounts(updatedAccounts);
    setShowEditUserModal(false);
    setEditingUserId(null);
    alert('Data Pejuang berhasil diperbarui.');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      alert('Mohon lengkapi Username dan Nama Pejuang.');
      return;
    }
    
    // Check for duplicates
    if (accounts.some(a => a.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Username ini sudah terdaftar. Silakan gunakan username lain.');
      return;
    }
    if (accounts.some(a => a.name.toLowerCase() === newName.trim().toLowerCase())) {
      alert('Nama Pejuang ini sudah terdaftar. Jangan sampai ada nama pejuang yang double.');
      return;
    }

    const email = newEmail.trim() || `${newUsername.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@albahjah.or.id`;
    let uid = `usr-${Date.now()}`;
    
    try {
      if (newPassword && newPassword.length >= 6) {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email, newPassword);
        uid = cred.user.uid;
      }
    } catch (err: any) {
      console.warn('Firebase user creation note:', err.code, err.message);
    }

    const newUser: UserAccount = {
      id: uid,
      username: newUsername.trim(),
      password: newPassword,
      name: newName.trim(),
      role: newRole,
      subDivisi: newSubDivisi,
      amanah: newAmanah,
      email: email,
    };

    onSaveAccounts([...accounts, newUser]);
    setShowAddUserModal(false);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('User123');
    setNewName('');
    alert(`Data Pejuang ${newName} (${newRole}) berhasil ditambahkan dan disimpan ke Firestore!`);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      onSaveAccounts(accounts.filter((a) => a.id !== id));
    }
  };


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage('');
    setPasswordChangeError(false);
    
    if (newAccPassword !== confirmNewPassword) {
      setPasswordChangeError(true);
      setPasswordChangeMessage('Password baru tidak cocok.');
      return;
    }
    if (newAccPassword.length < 6) {
      setPasswordChangeError(true);
      setPasswordChangeMessage('Password baru minimal 6 karakter.');
      return;
    }

    const fbUser = auth.currentUser;
    if (!fbUser || !fbUser.email) {
      setPasswordChangeError(true);
      setPasswordChangeMessage('Gagal mendapatkan sesi pejuang.');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(fbUser.email, oldPassword);
      await reauthenticateWithCredential(fbUser, credential);
      
      // Update password
      await updatePassword(fbUser, newAccPassword);
      
      // Update Firestore with last changed time
      const updatedAccounts = accounts.map(a => 
        a.id === currentUser.id 
          ? { ...a, passwordLastUpdated: new Date().toISOString() } 
          : a
      );
      onSaveAccounts(updatedAccounts);
      
      setPasswordChangeError(false);
      setPasswordChangeMessage('Password berhasil diubah!');
      setOldPassword('');
      setNewAccPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordChangeError(true);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setPasswordChangeMessage('Password lama salah.');
      } else {
        setPasswordChangeMessage('Terjadi kesalahan: ' + err.message);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Pengaturan Sistem Terpusat</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            Kelola Aplikasi & Konfigurasi Pondok
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengaturan koordinat GPS, jam kerja divisi, akun pejuang, dan Manhajiah Al-Bahjah
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('profil')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profil'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
            }`}
          >
            Data Profil Sistem
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('lokasi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'lokasi'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                Lokasi GPS
              </button>
              <button
                onClick={() => setActiveTab('jadwal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'jadwal'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                Jam Kerja
              </button>
              <button
                onClick={() => setActiveTab('pejuang')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'pejuang'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                Data Pejuang
              </button>
              <button
                onClick={() => setActiveTab('manhajiah')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'manhajiah'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                Manhajiah
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'backup'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                Backup & Restore
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content: Profil Pengguna & Logo Sistem */}
      {activeTab === 'profil' && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-6 max-w-2xl">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Data Profil Sistem & Akun</span>
          </h2>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 transition-colors"
                title="Unggah Foto"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{currentUser.name}</h3>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{currentUser.role} - {currentUser.subDivisi}</p>
              <p className="text-xs text-slate-500 mt-1">{currentUser.amanah}</p>
              
              <div className="mt-3 flex items-center justify-center md:justify-start space-x-1 text-[10px] sm:text-xs text-slate-500 bg-slate-100 dark:bg-slate-800/50 w-fit px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                <Key className="w-3 h-3 text-emerald-600" />
                <span>
                  Sandi Diperbarui: {currentUser.passwordLastUpdated ? new Date(currentUser.passwordLastUpdated).toLocaleDateString('id-ID') : 'Belum Pernah'}
                </span>
              </div>
            </div>
          </div>

          {/* Lokasi Absen Terakhir */}
          {(() => {
            const myAtt = attendance
              .filter(a => a.pejuangId === currentUser.id && a.lat && a.lng)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            if (myAtt.length > 0) {
              const lastAtt = myAtt[0];
              return (
                <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Lokasi Absen Terakhir (Berdasarkan GPS)</span>
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Terakhir absen pada {lastAtt.date} {lastAtt.time}
                  </div>
                  <LocationMap 
                    userLat={lastAtt.lat!}
                    userLng={lastAtt.lng!}
                    pondokLat={locationSettings.latitude}
                    pondokLng={locationSettings.longitude}
                    radius={locationSettings.radiusMaxMeters}
                  />
                </div>
              );
            }
            return null;
          })()}


          {/* Ganti Password */}
          <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Ganti Password Akun</span>
              </h3>
              {currentUser.passwordLastUpdated && (
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Terakhir diubah: {new Date(currentUser.passwordLastUpdated).toLocaleDateString('id-ID')}
                </div>
              )}
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordChangeMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold ${passwordChangeError ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {passwordChangeMessage}
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password Lama</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none"
                    placeholder="Masukkan password lama"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                {isChangingPassword ? 'Menyimpan...' : 'Perbarui Password'}
              </button>
            </form>
          </div>

          {/* Pengaturan Logo Portal Khusus Admin */}
          {isAdmin && (
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan Upload Logo Portal (Pondok Pesantren Al-Bahjah)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Format gambar yang didukung adalah JPG atau PNG. Logo ini akan langsung tersimpan di database (Firestore) dan secara otomatis menggantikan ikon di layar masuk (Login) dan sudut atas Sidebar navigasi semua pejuang.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-900/40">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-emerald-400/50 flex items-center justify-center overflow-hidden shadow-inner p-1 relative flex-shrink-0">
                  {appLogoUrl ? (
                    <img src={appLogoUrl} alt="Logo Aplikasi" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">B</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-white">
                    {appLogoUrl ? 'Logo Kustom Aktif' : 'Menggunakan Lambang Bawaan (Default)'}
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingLogo ? 'Mengunggah...' : 'Unggah Logo Baru (JPG/PNG)'}</span>
                    </button>
                    {appLogoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs transition-colors"
                      >
                        Hapus Logo (Reset)
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pengaturan Template Surat Izin Keluar Khusus Admin */}
          {isAdmin && (
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan Format / Template Surat Izin Keluar</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Unggah template PDF Surat Izin (dalam bentuk gambar JPG/PNG ukuran A5). Sistem akan secara otomatis menempatkan teks nama pejuang, divisi, dan waktu ke atas gambar ini saat PDF di-generate.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="w-24 h-32 rounded-lg bg-white dark:bg-slate-900 border-2 border-dashed border-emerald-400/50 flex items-center justify-center overflow-hidden shadow-inner p-1 relative flex-shrink-0">
                  {suratIzinTemplateUrl ? (
                    <img src={suratIzinTemplateUrl} alt="Template Surat" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center px-2">Belum ada template</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-white">
                    {suratIzinTemplateUrl ? 'Template Surat Aktif' : 'Gunakan Format Standar A5 Kosong'}
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      disabled={isUploadingTemplate}
                      onClick={() => templateInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingTemplate ? 'Mengunggah...' : 'Unggah Template (JPG/PNG)'}</span>
                    </button>
                    {suratIzinTemplateUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveTemplate}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs transition-colors"
                      >
                        Hapus Template
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={templateInputRef}
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleTemplateUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kepala Pondok Pesantren (Untuk TTD Surat Izin)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={kepalaPondokName || ''}
                      onChange={(e) => {
                        if (onSaveGeneralSettings) {
                          onSaveGeneralSettings({ kepalaPondokName: e.target.value });
                        }
                      }}
                      placeholder="Contoh: Buya Yahya"
                      className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Pengaturan Template & Approval Cuti</h3>
                
                {/* Template Cuti Upload */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-24 h-32 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                    {suratCutiTemplateUrl ? (
                      <img src={suratCutiTemplateUrl} alt="Template Cuti" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                        <span className="text-[9px] text-slate-400 font-medium leading-tight block">A5 Format<br/>(Cuti)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-white">
                      {suratCutiTemplateUrl ? 'Template Surat Cuti Aktif' : 'Gunakan Format Standar A5 Kosong (Cuti)'}
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        disabled={isUploadingTemplateCuti}
                        onClick={() => templateCutiInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingTemplateCuti ? 'Mengunggah...' : 'Unggah Template Cuti (JPG/PNG)'}</span>
                      </button>
                      {suratCutiTemplateUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveTemplateCuti}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs transition-colors"
                        >
                          Hapus Template Cuti
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={templateCutiInputRef}
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleTemplateCutiUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Pejuang Berwenang Approve Izin Keluar (Maks 9)
                    </label>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1">
                      {accounts.filter(a => a.role === 'Pejuang').map(acc => (
                        <label key={`izin-${acc.id}`} className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={izinKeluarApprovers.includes(acc.id)}
                            onChange={() => toggleApprover('izin', acc.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                          <div className="ml-3">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{acc.name}</p>
                            <p className="text-[10px] text-slate-500">{acc.subDivisi}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Pejuang Berwenang Approve Cuti (Maks 9)
                    </label>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1">
                      {accounts.filter(a => a.role === 'Pejuang').map(acc => (
                        <label key={`cuti-${acc.id}`} className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={cutiApprovers.includes(acc.id)}
                            onChange={() => toggleApprover('cuti', acc.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                          <div className="ml-3">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{acc.name}</p>
                            <p className="text-[10px] text-slate-500">{acc.subDivisi}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700/50">
             <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Tampilan Aplikasi</h3>
             <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl max-w-xl flex-wrap">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl transition-all ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-xs">Terang</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-xs">Gelap</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl transition-all ${
                    theme === 'system'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs">Sistem</span>
                </button>
                <button
                  onClick={() => setTheme('auto-sun')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl transition-all ${
                    theme === 'auto-sun'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 text-orange-500" />
                  <Moon className="w-4 h-4 text-emerald-500 -ml-2" />
                  <span className="text-xs">Auto (Matahari)</span>
                </button>
             </div>
          </div>

          
          {/* Biometrik Section */}
          <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Keamanan & Biometrik</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sidik Jari / Face ID</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentUser.webAuthnCredentialId ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {currentUser.webAuthnCredentialId ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {currentUser.webAuthnCredentialId 
                    ? 'Biometrik Anda sudah terdaftar. Anda bisa menggunakan ini untuk login dengan cepat.'
                    : 'Daftarkan sidik jari atau Face ID Anda untuk login lebih mudah dan aman.'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {currentUser.webAuthnCredentialId && (
                  <button
                    onClick={async () => {
                      if (confirm('Apakah Anda yakin ingin menghapus data biometrik Anda? Anda tidak akan bisa lagi login menggunakan sidik jari/Face ID sampai Anda mendaftarkannya kembali.')) {
                        const updatedAccounts = accounts.map(a => 
                          a.id === currentUser.id 
                            ? { ...a, webAuthnCredentialId: undefined }
                            : a
                        );
                        onSaveAccounts(updatedAccounts);
                        alert('Data biometrik berhasil dihapus.');
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                  >
                    Hapus
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (!window.PublicKeyCredential) {
                      alert('Perangkat Anda tidak mendukung WebAuthn / Biometrik.');
                      return;
                    }
                    try {
                      const challenge = new Uint8Array(32);
                      crypto.getRandomValues(challenge);
                      const userId = new Uint8Array(16);
                      crypto.getRandomValues(userId);

                      const createCredentialArgs: CredentialCreationOptions = {
                        publicKey: {
                          challenge: challenge,
                          rp: { name: 'Al-Bahjah App' },
                          user: {
                            id: userId,
                            name: currentUser.username || currentUser.email || 'user',
                            displayName: currentUser.name
                          },
                          pubKeyCredParams: [
                            { type: 'public-key', alg: -7 },
                            { type: 'public-key', alg: -257 }
                          ],
                          authenticatorSelection: { userVerification: 'preferred' },
                          timeout: 60000,
                          attestation: 'none'
                        }
                      };

                      const cred = await navigator.credentials.create(createCredentialArgs) as PublicKeyCredential;
                      if (cred && cred.id) {
                        const updatedAccounts = accounts.map(a => 
                          a.id === currentUser.id 
                            ? { ...a, webAuthnCredentialId: cred.id }
                            : a
                        );
                        onSaveAccounts(updatedAccounts);
                        alert('Biometrik berhasil didaftarkan!');
                      }
                    } catch (e: any) {
                      console.error(e);
                      alert('Gagal mendaftarkan biometrik: ' + e.message + '\n\nJika Anda membuka aplikasi ini di dalam browser internal atau iframe, silakan buka langsung di tab baru (Safari/Chrome).');
                    }
                  }}
                  className={"px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all " + (currentUser.webAuthnCredentialId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-600 hover:bg-emerald-500")}
                >
                  {currentUser.webAuthnCredentialId ? 'Perbarui Biometrik' : 'Daftarkan Biometrik'}
                </button>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700/50">
             <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
               <Bell className="w-4 h-4 text-emerald-500" />
               <span>Push Notifications & Alerts</span>
             </h3>
             <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl max-w-sm border border-slate-200 dark:border-slate-700/50">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Status Izin & Cuti</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Dapatkan notifikasi perubahan status.</p>
                </div>
                <button
                  onClick={handleTogglePushNotifications}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                    currentUser.pushNotificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform transform ${
                      currentUser.pushNotificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
             </div>
          </div>

          {isAdmin && (
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700/50">
               <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
                 <Bell className="w-4 h-4 text-amber-500" />
                 <span>Pengumuman Global (Broadcast)</span>
               </h3>
               <div className="space-y-3 max-w-sm">
                 <textarea
                   value={broadcastMsgInput}
                   onChange={(e) => setBroadcastMsgInput(e.target.value)}
                   placeholder="Tulis pesan pengumuman untuk seluruh pejuang..."
                   className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                   rows={3}
                 />
                 <div className="flex space-x-2">
                 <button
                   onClick={() => {
                     if (onSaveGeneralSettings) {
                       onSaveGeneralSettings({ broadcastMessage: broadcastMsgInput });
                       alert('Pengumuman berhasil disiarkan!');
                     }
                   }}
                   className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex-1"
                 >
                   Siarkan Pengumuman
                 </button>
                 {broadcastMessage && (
                   <button
                     onClick={() => {
                       if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                         if (onSaveGeneralSettings) {
                           onSaveGeneralSettings({ broadcastMessage: '' });
                           setBroadcastMsgInput('');
                           alert('Pengumuman berhasil dihapus!');
                         }
                       }
                     }}
                     className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                   >
                     Hapus Pengumuman
                   </button>
                 )}
                 </div>
               </div>
            </div>
          )}

        </div>
      )}

      {/* Tab Content 1: Lokasi GPS Pondok */}
      {activeTab === 'lokasi' && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4 max-w-2xl">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Koordinat Titik Pondok & Radius Presensi</span>
          </h2>

          <form onSubmit={handleSaveLocation} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nama Alamat / Lokasi Pondok
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={Number.isNaN(lat) ? '' : lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={Number.isNaN(lng) ? '' : lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Radius Maksimal Absensi (dalam Meter)
              </label>
              <input
                type="number"
                required
                value={Number.isNaN(radius) ? '' : radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Lokasi</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab Content 2: Jam Kerja Divisi */}
      {activeTab === 'jadwal' && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan Jam Kerja & Hari Kerja Divisi/Individu</span>
            </h2>
            <button
              onClick={() => setShowAddScheduleModal(true)}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-300 pr-8">
                    {sch.targetName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 font-bold">
                    {sch.targetType}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteSchedule(sch.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
                  title="Hapus jadwal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Jam Masuk (Subuh)</span>
                    <strong className="text-slate-800 dark:text-slate-100">{sch.jamMasuk} WIB</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Jam Pulang / Selesai</span>
                    <strong className="text-slate-800 dark:text-slate-100">{sch.jamPulang} WIB</strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Hari Kerja:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sch.hariKerja.map((h) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Data Pejuang */}
      {activeTab === 'pejuang' && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Manajemen Data Pejuang & Admin ({accounts.length} Akun)</span>
            </h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Cari nama, username, atau ID..."
                value={pejuangSearchQuery}
                onChange={(e) => {
                  setPejuangSearchQuery(e.target.value);
                  setPejuangCurrentPage(1);
                }}
                className="w-48 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setShowAddUserModal(true)}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pejuang</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Nama Pejuang</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Sub Divisi</th>
                  <th className="py-2.5 px-3">Amanah</th>
                  <th className="py-2.5 px-3">NIPY</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts
                  .filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.id.toLowerCase().includes(pejuangSearchQuery.toLowerCase()))
                  .slice((pejuangCurrentPage - 1) * pejuangItemsPerPage, pejuangCurrentPage * pejuangItemsPerPage)
                  .map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                      {acc.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {acc.username}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          acc.role === 'Admin'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                        }`}
                      >
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                      {acc.subDivisi}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {acc.amanah}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                      {acc.nipy || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingUserId(acc.id);
                          setNewUsername(acc.username);
                          setNewEmail(acc.email || '');
                          setNewPassword(acc.password || '');
                          setNewName(acc.name);
                          setNewRole(acc.role);
                          setNewSubDivisi(acc.subDivisi);
                          setNewAmanah(acc.amanah);
                          setNewNipy(acc.nipy || '');
                          setShowEditUserModal(true);
                        }}
                        className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 mr-2"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(acc.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.id.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage) > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Halaman {pejuangCurrentPage} dari {Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.id.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage)}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPejuangCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pejuangCurrentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPejuangCurrentPage(prev => Math.min(Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.id.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage), prev + 1))}
                  disabled={pejuangCurrentPage === Math.ceil(accounts.filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.id.toLowerCase().includes(pejuangSearchQuery.toLowerCase())).length / pejuangItemsPerPage)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Manhajiah */}
      {activeTab === 'manhajiah' && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Kaidah Manhajiah Pejuang Al-Bahjah ({manhajiyyahClauses.length} Pasal)</span>
            </h2>
            {isAdmin && (
              <button 
                onClick={() => {
                  setEditingManhajiyyahId(null);
                  setManBab('');
                  setManPasalNumber('');
                  setManTitle('');
                  setManCategory('');
                  setManContent('');
                  setShowManhajiyyahModal(true);
                }}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + Tambah Pasal
              </button>
            )}
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {manhajiyyahClauses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 relative group"
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button 
                      onClick={() => {
                        setEditingManhajiyyahId(c.id);
                        setManBab(c.bab || '');
                        setManPasalNumber(c.pasalNumber?.toString() || '');
                        setManTitle(c.title);
                        setManCategory(c.category);
                        setManContent(c.content);
                        setShowManhajiyyahModal(true);
                      }}
                      className="p-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteManhajiyyah(c.id)}
                      className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg"
                    >
                      Hapus
                    </button>
                  </div>
                )}
                <div className="flex flex-col space-y-1">
                  <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">
                    {c.bab ? `Bab ${c.bab}` : ''} {c.category ? `- ${c.category}` : ''}
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                    Pasal {c.pasalNumber}: {c.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {/* Modal Tambah Pejuang */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Tambah Data Pejuang Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Lengkap Pejuang</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Muhammad Fatih"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: fatih"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Kata Sandi (Password)</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email (Opsional / Otomatis)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Contoh: pejuang@albahjah.or.id"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Hak Akses (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Pejuang')}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Pejuang">Pejuang</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sub Divisi</label>
                  <input
                    type="text"
                    required
                    value={newSubDivisi}
                    onChange={(e) => setNewSubDivisi(e.target.value)}
                    placeholder="Contoh: Media / Keuangan"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Amanah / Tugas Utama</label>
                <input
                  type="text"
                  required
                  value={newAmanah}
                  onChange={(e) => setNewAmanah(e.target.value)}
                  placeholder="Contoh: Koordinator Produksi Audio Visual"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Simpan Pejuang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pejuang */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
                <Edit className="w-4 h-4 text-emerald-600" />
                <span>Edit Data Pejuang</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditUserSave} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Lengkap Pejuang</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">NIPY</label>
                  <input
                    type="text"
                    value={newNipy}
                    onChange={(e) => setNewNipy(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Kata Sandi (Password)</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Hak Akses (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Pejuang')}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Pejuang">Pejuang</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sub Divisi</label>
                  <input
                    type="text"
                    required
                    value={newSubDivisi}
                    onChange={(e) => setNewSubDivisi(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Amanah / Tugas Utama</label>
                <input
                  type="text"
                  required
                  value={newAmanah}
                  onChange={(e) => setNewAmanah(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Jadwal Kerja */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Tambah Jadwal & Jam Kerja Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddScheduleModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Target Jadwal</label>
                  <select
                    value={schTargetType}
                    onChange={(e) => setSchTargetType(e.target.value as 'Divisi' | 'Individu')}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Divisi">Berdasarkan Divisi</option>
                    <option value="Individu">Perorangan (Individu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {schTargetType === 'Divisi' ? 'Pilih / Nama Divisi' : 'Pilih Nama Pejuang'}
                  </label>
                  {schTargetType === 'Divisi' ? (
                    <input
                      type="text"
                      required
                      value={schTargetName}
                      onChange={(e) => setSchTargetName(e.target.value)}
                      placeholder="Contoh: Media / Keuangan / Dapur"
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  ) : (
                    <select
                      value={schTargetName}
                      onChange={(e) => setSchTargetName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="">-- Pilih Pejuang --</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.name}>
                          {acc.name} ({acc.subDivisi})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Masuk (Subuh/Pagi)</label>
                  <input
                    type="time"
                    required
                    value={schJamMasuk}
                    onChange={(e) => setSchJamMasuk(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Pulang / Selesai</label>
                  <input
                    type="time"
                    required
                    value={schJamPulang}
                    onChange={(e) => setSchJamPulang(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Hari Kerja Aktif</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((hari) => {
                    const isSelected = schHariKerja.includes(hari);
                    return (
                      <button
                        type="button"
                        key={hari}
                        onClick={() => toggleHariKerja(hari)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {hari}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Manhajiyyah */}
      {showManhajiyyahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {editingManhajiyyahId ? 'Edit Pasal Manhajiah' : 'Tambah Pasal Manhajiah Baru'}
              </h3>
              <button
                onClick={() => setShowManhajiyyahModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveManhajiyyah} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bab (Opsional)</label>
                  <input
                    type="text"
                    value={manBab}
                    onChange={(e) => setManBab(e.target.value)}
                    placeholder="Contoh: I / II / III"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori / Topik</label>
                  <input
                    type="text"
                    value={manCategory}
                    onChange={(e) => setManCategory(e.target.value)}
                    placeholder="Contoh: Kedisiplinan"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No Pasal</label>
                  <input
                    type="text"
                    required
                    value={manPasalNumber}
                    onChange={(e) => setManPasalNumber(e.target.value)}
                    placeholder="Contoh: 1 / 1A"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Pasal</label>
                  <input
                    type="text"
                    required
                    value={manTitle}
                    onChange={(e) => setManTitle(e.target.value)}
                    placeholder="Contoh: Kewajiban Mengajar"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Isi Pasal</label>
                <textarea
                  required
                  rows={8}
                  value={manContent}
                  onChange={(e) => setManContent(e.target.value)}
                  placeholder="Ketik isi / detail pasal di sini..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Simpan Pasal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab Backup */}
      {activeTab === 'backup' && isAdmin && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              <span>Backup Data Sistem</span>
            </h2>
            <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Backup Data Saat Ini</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Sistem otomatis terhubung ke Firestore.
                </p>
              </div>
              <button 
                onClick={() => alert('Data telah otomatis tersimpan aman di Cloud Firestore Database.')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Status Backup: Aman (Auto-Sync)
              </button>
            </div>

            <div className="p-5 border border-rose-200 dark:border-rose-900/50 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex flex-col justify-between mt-4">
              <div>
                <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 mb-2">Hapus Database Absensi (Per Bulan)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Fitur ini akan menghapus keseluruhan data absensi kehadiran pada bulan tertentu (Kecuali data Cuti dan Slip Ubar). Masukkan format bulan (Contoh: "Agustus 2026") dan kata sandi Anda untuk konfirmasi.
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Contoh: Agustus 2026"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="password"
                  placeholder="Masukkan Kata Sandi Admin Anda"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button 
                  onClick={async () => {
                    if (!deleteMonth) {
                      alert('Masukkan bulan yang ingin dihapus.');
                      return;
                    }
                    if (deletePassword !== currentUser.password) {
                      alert('Kata sandi salah. Tindakan ditolak.');
                      return;
                    }
                    if (confirm(`PERINGATAN BAHAYA: Apakah Anda benar-benar yakin ingin MENGHAPUS PERMANEN seluruh data absensi untuk bulan "${deleteMonth}"? Data yang sudah dihapus tidak dapat dikembalikan.`)) {
                      if (onDeleteAttendanceByMonth) {
                        try {
                          await onDeleteAttendanceByMonth(deleteMonth);
                          alert(`Seluruh data absensi bulan "${deleteMonth}" berhasil dihapus.`);
                          setDeleteMonth('');
                          setDeletePassword('');
                        } catch (err) {
                          alert('Terjadi kesalahan saat menghapus data.');
                        }
                      }
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Hapus Permanen Data Absensi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
