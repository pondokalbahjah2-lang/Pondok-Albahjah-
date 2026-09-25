import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen,
  CalendarOff,
  Search,
  Plus,
  Pin,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserAccount } from '../types';
import { getHijriDate, formatMasehiDate } from '../utils/hijriCalendar';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatedThemeToggle } from './AnimatedThemeToggle';
import { AnimatedLogoutButton } from './AnimatedLogoutButton';

interface iOSGlassLayoutProps {
  appLogoUrl?: string;
  broadcastMessage?: string;
  currentUser: UserAccount;
  accounts?: UserAccount[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  leaveRequests?: any[];
  exitPermissions?: any[];
  liburPengurusList?: any[];
  izinKeluarApprovers?: string[];
  cutiApprovers?: string[];
  children: React.ReactNode;
  notifications?: any[];
  onMarkNotificationRead?: (id: string) => void;
}

export const IOSGlassLayout: React.FC<iOSGlassLayoutProps> = ({
  appLogoUrl,
  broadcastMessage,
  currentUser,
  accounts = [],
  activeTab,
  setActiveTab,
  onLogout,
  leaveRequests = [],
  exitPermissions = [],
  liburPengurusList = [],
  izinKeluarApprovers = [],
  cutiApprovers = [],
  children,
  notifications = [],
  onMarkNotificationRead,
}) => {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  // Desktop sidebar interactive state
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('desktop_sidebar_pinned') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isExpanded = isHovered || isPinned;

  const togglePinned = () => {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem('desktop_sidebar_pinned', String(next));
      return next;
    });
  };

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

  const isUserInList = (list: any[] = [], user?: UserAccount | null) => {
    if (!user || !list || !Array.isArray(list)) return false;
    const uName = (user.name || '').toLowerCase().trim();
    const uUsername = (user.username || '').toLowerCase().trim();
    const uId = (user.id || '').toLowerCase().trim();
    return list.some(item => {
      if (!item || typeof item !== 'string') return false;
      const itm = item.toLowerCase().trim();
      return itm === uName || itm === uUsername || itm === uId;
    });
  };

  const isExplicitCutiApprover = currentUser?.role === 'Admin' || isUserInList(cutiApprovers, currentUser);
  const isLeaderCutiApprover = Boolean(((currentUser?.amanah) || '').toLowerCase().match(/ketua|kepala|manajer|manager|koordinator/));

  const isCutiApprover = (recSubDivisi?: string, pejuangId?: string) => {
    if (isExplicitCutiApprover) return true;
    if (!isLeaderCutiApprover) return false;
    const userDiv = ((currentUser?.subDivisi) || '').toLowerCase().replace(/^(divisi|sub\s*divisi)\s+/i, '').trim();
    if (!userDiv) return true;
    let targetDiv = (recSubDivisi || '').toLowerCase().replace(/^(divisi|sub\s*divisi)\s+/i, '').trim();
    if (!targetDiv && pejuangId && Array.isArray(accounts)) {
      const p = accounts.find(a => a && a.id === pejuangId);
      targetDiv = ((p?.subDivisi) || '').toLowerCase().replace(/^(divisi|sub\s*divisi)\s+/i, '').trim();
    }
    if (!targetDiv) return true;
    return userDiv === targetDiv || userDiv.includes(targetDiv) || targetDiv.includes(userDiv);
  };

  const isExplicitIzinApprover = currentUser?.role === 'Admin' || isUserInList(izinKeluarApprovers, currentUser);
  const isLeaderIzinApprover = Boolean(((currentUser?.amanah) || '').toLowerCase().match(/ketua|kepala|manajer|manager|koordinator/));

  const isIzinApprover = (recSubDivisi?: string, pejuangId?: string) => {
    if (isExplicitIzinApprover) return true;
    if (!isLeaderIzinApprover) return false;
    const userDiv = ((currentUser?.subDivisi) || '').toLowerCase().replace(/^(divisi|sub\s*divisi)\s+/i, '').trim();
    if (!userDiv) return true;
    let targetDiv = (recSubDivisi || '').toLowerCase().replace(/^(divisi|sub\s*divisi)\s+/i, '').trim();
    if (!targetDiv && pejuangId && Array.isArray(accounts)) {
      const p = accounts.find(a => a && a.id === pejuangId);
      targetDiv = ((p?.subDivisi) || '').toLowerCase().replace(/^(divisi|sub\s*divisi)\s+/i, '').trim();
    }
    if (!targetDiv) return true;
    return userDiv === targetDiv || userDiv.includes(targetDiv) || targetDiv.includes(userDiv);
  };

  const pendingCutiCount = (Array.isArray(leaveRequests) ? leaveRequests : []).filter(l => l && l.status === 'Menunggu Persetujuan' && (isCutiApprover(l.subDivisi, l.pejuangId) || l.pejuangId === currentUser?.id)).length;
  const pendingIzinCount = (Array.isArray(exitPermissions) ? exitPermissions : []).filter(e => e && e.status === 'Menunggu Persetujuan' && (isIzinApprover(e.subDivisi, e.pejuangId) || e.pejuangId === currentUser?.id)).length;
  const pendingLiburCount = (Array.isArray(liburPengurusList) ? liburPengurusList : []).filter(l => l && l.status === 'Menunggu Persetujuan' && (currentUser?.role === 'Admin' || l.pejuangId === currentUser?.id || l.badalId === currentUser?.id)).length;

  const adminNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'izin', label: 'Izin Keluar', icon: CalendarCheck, badge: pendingIzinCount },
    { id: 'absensi', label: 'Absensi GPS', icon: MapPin },
    { id: 'cuti', label: 'Pengajuan Cuti', icon: Calendar, badge: pendingCutiCount },
    { id: 'libur', label: 'Izin Libur Pengurus', icon: CalendarOff, badge: pendingLiburCount },
    { id: 'ubar', label: 'Slip Ubar', icon: FileText },
    { id: 'sp', label: 'Surat SP & Teguran', icon: AlertOctagon },
    { id: 'kalender', label: 'Kalender Cuti', icon: FileSpreadsheet },
    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },
    { id: 'laporan', label: 'Unduh Laporan', icon: Download },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings }
  ];

  const pendingIzinCountUser = pendingIzinCount;
  const userNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'absensi', label: 'Absensi GPS', icon: MapPin },
    { id: 'izin', label: 'Izin Keluar', icon: CalendarCheck, badge: pendingIzinCountUser },
    { id: 'cuti', label: 'Pengajuan Cuti', icon: Calendar, badge: pendingCutiCount },
    { id: 'libur', label: 'Izin Libur Pengurus', icon: CalendarOff, badge: pendingLiburCount },
    { id: 'ubar', label: 'Slip Ubar', icon: FileText },
    { id: 'sp', label: 'Surat SP & Teguran', icon: AlertOctagon },
    { id: 'kalender', label: 'Kalender Cuti', icon: FileSpreadsheet },
    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings }
  ];

  const navigationItems = currentUser.role === 'Admin' ? adminNavigationItems : userNavigationItems;

  // Filter navigation items by search query
  const filteredNavItems = navigationItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.read);
  const hasNotifications = unreadNotifications.length > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        isDarkMode
          ? 'bg-[#0f1218] text-slate-100'
          : 'bg-[#f4f6f9] text-slate-800'
      }`}
    >
      {/* Background ambient liquid orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen pb-24 md:pb-0 md:flex-row">
        
        {/* ========================================================= */}
        {/* DESKTOP FLOATING SIDEBAR DOCK (As seen in the Video)     */}
        {/* ========================================================= */}
        <motion.aside
          initial={false}
          animate={{ width: isExpanded ? 272 : 76 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden md:flex fixed left-4 top-4 bottom-4 z-50 flex-col justify-between p-3.5 rounded-[30px] bg-white/95 dark:bg-[#161a23]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 overflow-hidden"
          style={{ willChange: 'width' }}
        >
          {/* Top Section: Avatar & Search */}
          <div className="flex flex-col">
            {/* Expanded User Profile Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 min-h-[54px]">
              <div className="flex items-center gap-3 overflow-hidden">
                {/* User Avatar Circle */}
                <div 
                  onClick={() => setActiveTab('settings')}
                  className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800/90 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-base flex items-center justify-center shrink-0 cursor-pointer shadow-sm overflow-hidden"
                >
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser?.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    (currentUser?.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>

                {/* Name & Role (Visible when expanded) */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col truncate overflow-hidden"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name || 'Pengguna'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.role === 'Admin' ? 'Administrator' : (currentUser?.subDivisi || 'Pejuang Al-Bahjah')}
                  </span>
                </motion.div>
              </div>

              {/* Pin / Toggle Button (Visible when expanded) */}
              {isExpanded && (
                <button
                  onClick={togglePinned}
                  title={isPinned ? 'Lepas Pin Sidebar' : 'Pin Sidebar Terbuka'}
                  className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                    isPinned 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'rotate-45 text-emerald-600' : ''}`} />
                </button>
              )}
            </div>

            {/* Search Section */}
            <div className="mt-3">
              {isExpanded ? (
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dashboard..."
                    className="w-full pl-3.5 pr-8 py-2 text-xs rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsHovered(true);
                    setTimeout(() => searchInputRef.current?.focus(), 150);
                  }}
                  className="w-11 h-11 mx-auto rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Cari Menu"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation Menu List */}
            <nav className="mt-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 hide-scrollbar">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={item.label}
                    className={`w-full flex items-center transition-all ${
                      isExpanded
                        ? `px-3 py-2.5 rounded-2xl justify-between ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                          }`
                        : `w-11 h-11 mx-auto rounded-2xl justify-center relative ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                        
                        {/* Collapsed notification badge */}
                        {!isExpanded && item.badge ? (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center absolute -top-1.5 -right-2 shadow-sm border-2 border-white dark:border-[#161a23]">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Expanded text label */}
                      {isExpanded && (
                        <span className="text-xs truncate font-medium">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {/* Expanded notification pill */}
                    {isExpanded && item.badge ? (
                      <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Utility Actions (As seen in video) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-2">
            {isExpanded ? (
              /* Expanded Bottom: Horizontal 4-action dock */
              <div className="flex items-center justify-between gap-1 px-1">
                {/* 1. Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Ubah Tema"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                </button>

                {/* 2. Settings */}
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Pengaturan"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* 3. Plus Quick Action */}
                <button
                  onClick={() => setShowQuickActions(true)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  title="Aksi Cepat"
                >
                  <Plus className="w-4 h-4 font-bold" />
                </button>

                {/* 4. Logout */}
                <button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Collapsed Bottom: Vertical 4-action stack */
              <div className="flex flex-col items-center gap-2">
                {/* 1. Logout */}
                <button
                  onClick={onLogout}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                {/* 2. Plus Quick Action */}
                <button
                  onClick={() => setShowQuickActions(true)}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  title="Aksi Cepat"
                >
                  <Plus className="w-5 h-5 font-bold" />
                </button>

                {/* 3. Settings */}
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Pengaturan"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* 4. Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Ubah Tema"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
              </div>
            )}
          </div>
        </motion.aside>

        {/* ========================================================= */}
        {/* MOBILE HEADER TOP BAR (Preserved for small screens)        */}
        {/* ========================================================= */}
        <header className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
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
                  Portal Pejuang Al-Bahjah
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
                      {unreadNotifications.map((n: any) => (
                        <div key={n.id} onClick={() => onMarkNotificationRead && onMarkNotificationRead(n.id)} className="p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            {n.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <AnimatedThemeToggle
                isDarkMode={isDarkMode}
                onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              />
              <AnimatedLogoutButton
                onLogout={onLogout}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"
              />
            </div>
          </div>
          <div className="px-4 pb-3 flex justify-center w-full">
            <PrayerTimesWidget variant="compact" />
          </div>
        </header>

        {/* Broadcast Message Banner */}
        {broadcastMessage && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-center shadow-md z-50 sticky top-0 md:static animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="flex items-center gap-2">
              <span className="animate-pulse">⚠️</span>
              {broadcastMessage}
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN CONTENT AREA: CLEARANCE FOR FLOATING DESKTOP SIDEBAR */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col p-4 md:p-8 gap-6 relative min-h-0 overflow-y-auto md:pl-[104px]">
          {children}
        </main>

        {/* ========================================================= */}
        {/* MOBILE NAVIGATION GLASS BOTTOM BAR (iOS Liquid Bar)       */}
        {/* ========================================================= */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <nav className="p-2 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-white/20 shadow-2xl flex items-center justify-between overflow-x-auto hide-scrollbar relative">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl transition-colors duration-300 z-10 ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-pill"
                      className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl shadow-sm z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="relative">
                      <Icon className="w-5 h-5 shrink-0" />
                      {item.badge ? (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5 border border-white dark:border-slate-900">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                    <motion.span 
                      initial={false}
                      animate={{ 
                        width: isActive ? "auto" : 0, 
                        opacity: isActive ? 1 : 0,
                        marginLeft: isActive ? 4 : 0
                      }}
                      className="text-xs font-bold whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* QUICK ACTIONS MODAL (+ button in desktop dock) */}
      <AnimatePresence>
        {showQuickActions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              <button
                onClick={() => setShowQuickActions(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Aksi Cepat</h3>
                  <p className="text-xs text-slate-500">Pintas layanan santri & pejuang</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('absensi');
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600">Presensi GPS Shift</h4>
                    <p className="text-[10px] text-slate-500">Absen masuk atau pulang dinas</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('izin');
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600">Ajukan Izin Keluar</h4>
                    <p className="text-[10px] text-slate-500">Izin keluar komplek pesantren</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('cuti');
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-amber-600">Pengajuan Cuti</h4>
                    <p className="text-[10px] text-slate-500">Cuti tahunan atau izin terencana</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('kajian');
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-purple-600">Presensi Kajian</h4>
                    <p className="text-[10px] text-slate-500">Validasi hadir majelis Buya Yahya</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
