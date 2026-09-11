import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, DoorOpen, User } from 'lucide-react';

interface AnimatedSignInButtonProps {
  status: 'idle' | 'loading' | 'success';
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const AnimatedSignInButton: React.FC<AnimatedSignInButtonProps> = ({
  status,
  onClick,
  disabled,
  type = "submit",
  className = ""
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled || status !== 'idle'}
        layout
        initial={{ borderRadius: 16 }}
        animate={{ 
          width: status === 'idle' ? "100%" : 48,
          borderRadius: status === 'idle' ? 16 : 24,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative flex items-center justify-center h-12 overflow-hidden ${
          status === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
        } ${className}`}
        whileHover={status === 'idle' ? { scale: 1.02 } : {}}
        whileTap={status === 'idle' ? { scale: 0.98 } : {}}
      >
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
              className="flex items-center gap-2 font-extrabold text-xs"
            >
              <span>Masuk Ke Sistem</span>
              <DoorOpen className="w-4 h-4" />
            </motion.div>
          )}

          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
              className="relative flex items-center justify-center w-full h-full"
            >
              {/* Door Frame */}
              <motion.div 
                className="absolute z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <DoorOpen className="w-5 h-5 text-slate-950" />
              </motion.div>
              
              {/* Walking User */}
              <motion.div
                initial={{ x: -20, opacity: 0, scale: 0.8 }}
                animate={{ 
                  x: [ -20, 0, 5 ],
                  opacity: [0, 1, 0],
                  scale: [0.8, 0.8, 0.6]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute z-20"
              >
                <User className="w-4 h-4 text-slate-900 fill-slate-900" />
              </motion.div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center text-white"
            >
              <Check className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Status Text Below */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 text-[11px] font-semibold text-emerald-300"
          >
            {status === 'loading' ? 'Memasuki sistem...' : 'Berhasil masuk!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
