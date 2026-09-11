import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check } from 'lucide-react';

interface AnimatedDownloadButtonProps {
  onDownload: () => void;
  className?: string;
  text?: string;
}

export const AnimatedDownloadButton: React.FC<AnimatedDownloadButtonProps> = ({
  onDownload,
  className = "",
  text = "Unduh"
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = () => {
    if (status !== 'idle') return;
    setStatus('loading');
    
    // Simulate loading for the animation
    setTimeout(() => {
      onDownload();
      setStatus('success');
      
      // Reset after a while
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    }, 1500);
  };

  return (
    <motion.button
      type="button"
      layout
      onClick={handleClick}
      className={`relative overflow-hidden flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
        status === 'success' 
          ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
      } ${className}`}
      whileTap={status === 'idle' ? { scale: 0.95 } : {}}
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{text}</span>
          </motion.div>
        )}
        
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Memproses...</span>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Selesai</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress Bar Background Effect */}
      {status === 'loading' && (
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute left-0 top-0 bottom-0 bg-white/20 z-0"
        />
      )}
    </motion.button>
  );
};
