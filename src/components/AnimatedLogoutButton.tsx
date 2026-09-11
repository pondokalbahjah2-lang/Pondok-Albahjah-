import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

interface AnimatedLogoutButtonProps {
  onLogout: () => void;
  className?: string;
}

export const AnimatedLogoutButton: React.FC<AnimatedLogoutButtonProps> = ({ 
  onLogout,
  className = ""
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClick = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    // Simulate animation timing before triggering actual logout
    setTimeout(() => {
      onLogout();
      setIsLoggingOut(false);
    }, 800);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      layout
      className={`relative overflow-hidden flex items-center justify-center transition-colors ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center gap-1.5 relative z-10">
        <motion.div
          animate={isLoggingOut ? {
            x: [0, 20, 40],
            opacity: [1, 0, 0],
          } : {}}
          transition={{ duration: 0.5, ease: "easeIn" }}
          className="relative z-20"
        >
          <LogOut className={className.includes('w-3.5') ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </motion.div>
        
        {className.includes('Keluar') && (
          <AnimatePresence>
            {!isLoggingOut && (
              <motion.span
                key="text"
                initial={{ opacity: 1, width: "auto" }}
                exit={{ 
                  opacity: 0, 
                  width: 0,
                  x: -10,
                }}
                transition={{ duration: 0.3 }}
                className="whitespace-nowrap inline-block origin-left"
              >
                Keluar
              </motion.span>
            )}
          </AnimatePresence>
        )}
      </div>
      
      {/* Background sweep effect */}
      {isLoggingOut && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 bg-rose-500/20 z-0"
        />
      )}
    </motion.button>
  );
};
