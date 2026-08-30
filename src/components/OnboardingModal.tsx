import React, { useState } from 'react';
import { X, MapPin, CalendarCheck, FileText, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingModalProps {
  onClose: () => void;
  userName: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, userName }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Selamat Datang!",
      description: `Halo ${userName}, selamat datang di Portal Manajemen Pejuang Al-Bahjah. Mari kita lihat fitur-fitur utamanya!`, 
      icon: <span className="text-4xl text-emerald-500">👋</span>,
    },
    {
      title: "1. Presensi Kehadiran",
      description: "Lakukan absensi setiap hari langsung dari HP Anda. Sistem akan memverifikasi lokasi GPS Anda di dalam area Pondok. Jangan lupa untuk berswafoto (selfie) saat absen masuk dan pulang!",
      icon: <MapPin className="w-12 h-12 text-emerald-500" />,
    },
    {
      title: "2. Izin Keluar & Cuti",
      description: "Anda dapat mengajukan Izin Keluar atau Cuti Tahunan langsung melalui aplikasi. Status pengajuan Anda dapat dipantau apakah sedang menunggu atau sudah disetujui oleh Admin.",
      icon: <CalendarCheck className="w-12 h-12 text-amber-500" />,
    },
    {
      title: "3. Akses Slip Ubar",
      description: "Dokumen bulanan Slip Ubar Anda kini tersedia secara digital. Anda dapat mengunduh atau mencetak dokumen secara aman dengan perlindungan kata sandi yang dikirimkan ke Anda.",
      icon: <FileText className="w-12 h-12 text-blue-500" />,
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={step === steps.length - 1 ? onClose : undefined}
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10 border border-white/20 dark:border-white/10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-6 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                {steps[step].icon}
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">
                {steps[step].title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed min-h-[80px]">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots and Button */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === step ? 'bg-emerald-500 w-4' : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
          >
            {step === steps.length - 1 ? (
              <>
                Mulai Gunakan <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Lanjut <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
