import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  Calendar,
  FileText,
  AlertOctagon,
  FileSpreadsheet,
  Download,
  Settings,
  LogOut,
  Moon,
  Sun,
  User,
  Clock,
  Sparkles,
  Bell,
} from 'lucide-react';
import { UserAccount } from '../types';
import { getHijriDate, formatMasehiDate } from '../utils/hijriCalendar';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import { useTheme } from '../contexts/ThemeContext';

interface iOSGlassLayoutProps {
  appLogoUrl?: string;
  currentUser: UserAccount;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  leaveRequests?: any[];
  exitPermissions?: any[];
  children: React.ReactNode;
}

export const IOSGlassLayout: React.FC<iOSGlassLayoutProps> = ({
  appLogoUrl,
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  leaveRequests = [],
  exitPermissions = [],
  children,
}) => {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hijriDate = getHijriDate(currentTime);
  const masehiDateStr = formatMasehiDate(currentTime);
  const timeStr = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const pendingCutiCount = currentUser.role === 'Admin' ? leaveRequests.filter(l => l.status === 'Menunggu').length : 0;
  const pendingIzinCount = currentUser.role === 'Admin' ? exitPermissions.filter(e => e.status === 'Menunggu').length : 0;

  const adminNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'izin', label: 'Izin Keluar', icon: CalendarCheck, badge: pendingIzinCount },
    { id: 'absensi', label: 'Absensi GPS', icon: MapPin },
    { id: 'cuti', label: 'Pengajuan Cuti', icon: Calendar, badge: pendingCutiCount },
    { id: 'ubar', label: 'Slip Ubar', icon: FileText },
    { id: 'sp', label: 'Surat SP & Teguran', icon: AlertOctagon },
    { id: 'kalender', label: 'Kalender Pondok', icon: FileSpreadsheet },
    { id: 'laporan', label: 'Unduh Laporan', icon: Download },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings }
  ];

  const pendingIzinCountUser = currentUser.role !== 'Admin' ? exitPermissions.filter(e => e.pejuangId === currentUser.id && e.status === 'Menunggu').length : 0;
  const userNavigationItems = [
    { id: 'absensi', label: 'Absensi GPS', icon: MapPin },
    { id: 'izin', label: 'Izin Keluar', icon: CalendarCheck, badge: pendingIzinCountUser },
    { id: 'cuti', label: 'Pengajuan Cuti', icon: Calendar, badge: pendingCutiCount },
    { id: 'ubar', label: 'Slip Ubar', icon: FileText },
    { id: 'sp', label: 'Surat SP & Teguran', icon: AlertOctagon },
    { id: 'kalender', label: 'Kalender Pondok', icon: FileSpreadsheet },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings }
  ];

  const navigationItems = currentUser.role === 'Admin' ? adminNavigationItems : userNavigationItems;

  const approvedLeaves = leaveRequests.filter(
    l => l.pejuangId === currentUser.id && l.status === 'Disetujui'
  ).sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());

  const hasNotifications = approvedLeaves.length > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Background ambient liquid orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-30 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen pb-24 md:pb-0 md:flex-row">
        {/* Desktop Sidebar Nav - Liquid Glass UI */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 justify-between">
          <div>
            {/* App Brand Header */}
            <div className="flex items-center gap-3 px-2 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-400 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 flex items-center justify-center text-white font-bold text-xl overflow-hidden p-0.5">
                {appLogoUrl ? (
                  <img src={appLogoUrl} alt="Logo Pondok" className="w-full h-full object-contain" />
                ) : (
                  'B'
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">Portal Pejuang</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Al-Bahjah Cirebon 1
                </span>
              </div>
            </div>

            {/* Live Date & Time Widget */}
            <div className="mx-2 mb-4 p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {timeStr}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-semibold">
                  {hijriDate.formatted}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {masehiDateStr}
              </div>
            </div>

            <div className="mx-2 mb-6">
              <PrayerTimesWidget variant="compact" />
            </div>

            {/* Nav Menu Items */}
            <nav className="flex flex-col gap-1 mt-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-emerald-900/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-white text-emerald-600' : 'bg-red-500 text-white'}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile Card & Actions */}
          <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 relative">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-300/60 transition-colors relative"
                  title="Notifikasi"
                >
                  <Bell className="w-4 h-4" />
                  {hasNotifications && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
                {showNotifications && hasNotifications && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Notifikasi</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {approvedLeaves.map(l => (
                        <div key={l.id} className="p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            Cuti ({l.tanggalMulai}) disetujui!
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{l.catatanAdmin || 'Oleh Admin'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-300/60 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header Top Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-400 shadow-sm flex items-center justify-center font-bold text-white text-sm overflow-hidden p-0.5">
                {appLogoUrl ? (
                  <img src={appLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  'B'
                )}
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {hijriDate.formatted}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 relative">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 relative"
                >
                  <Bell className="w-4 h-4" />
                  {hasNotifications && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
                {showNotifications && hasNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Notifikasi</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {approvedLeaves.map(l => (
                        <div key={l.id} className="p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            Cuti ({l.tanggalMulai}) disetujui!
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{l.catatanAdmin || 'Oleh Admin'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="px-4 pb-3 flex justify-center w-full">
            <PrayerTimesWidget variant="compact" />
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 flex flex-col p-6 gap-6 relative min-h-0 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Navigation Glass Bottom Bar (iOS Liquid Bar) */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <nav className="p-2 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-white/20 shadow-2xl flex items-center gap-2 overflow-x-auto snap-x hide-scrollbar">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 snap-center flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 shrink-0" />
                    {item.badge ? (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5 border border-white dark:border-slate-900">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${isActive ? 'max-w-xs opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
