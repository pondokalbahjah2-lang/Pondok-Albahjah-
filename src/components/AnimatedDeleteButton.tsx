import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface AnimatedDeleteButtonProps {
  onDelete: () => void;
  className?: string;
  text?: string;
}

export const AnimatedDeleteButton: React.FC<AnimatedDeleteButtonProps> = ({ 
  onDelete, 
  className = "",
  text = "Hapus"
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    
    // Simulate animation timing before triggering actual delete
    setTimeout(() => {
      onDelete();
      setIsDeleting(false); // Reset in case item isn't removed from DOM
    }, 1200);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      layout
      className={`relative flex items-center justify-center overflow-hidden px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors ${className}`}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-1.5 relative z-10">
        <motion.div
          animate={isDeleting ? {
            rotate: [0, -20, 20, -20, 20, 0],
            scale: [1, 1.2, 1.2, 1.2, 1.2, 1],
          } : {}}
          transition={{ duration: 0.5 }}
          className="relative z-20"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.div>
        
        <AnimatePresence>
          {!isDeleting && (
            <motion.span
              key="text"
              initial={{ opacity: 1, width: "auto" }}
              exit={{ 
                opacity: 0, 
                width: 0,
                x: -15,
                scale: 0.5,
              }}
              transition={{ duration: 0.3 }}
              className="whitespace-nowrap inline-block origin-left"
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};
