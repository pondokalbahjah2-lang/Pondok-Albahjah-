import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export interface CircularShiftProgressProps {
  percentage: number;
  completedShifts: number;
  targetShifts: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  variant?: 'emerald' | 'blue' | 'amber' | 'dynamic';
  showRechartsBackground?: boolean;
  className?: string;
}

/**
 * High-performance Circular Progress Bar for Monthly Shift Attendance.
 * Supports D3 mathematical arc calculations with SVG and Recharts rendering.
 */
export const CircularShiftProgress: React.FC<CircularShiftProgressProps> = ({
  percentage,
  completedShifts,
  targetShifts,
  size = 120,
  strokeWidth = 10,
  label,
  subLabel,
  variant = 'dynamic',
  className = '',
}) => {
  const safePercentage = typeof percentage === 'number' && !isNaN(percentage) ? percentage : 0;
  const clampedPercentage = Math.max(0, Math.min(100, Math.round(safePercentage)));
  const safeCompleted = typeof completedShifts === 'number' && !isNaN(completedShifts) ? completedShifts : 0;
  const safeTarget = typeof targetShifts === 'number' && !isNaN(targetShifts) ? targetShifts : 0;

  // Unique ID for SVG gradient
  const uniqueId = React.useId ? React.useId().replace(/:/g, '_') : `grad_${size}_${clampedPercentage}`;

  // Dynamic color palette based on completion percentage
  const getColor = (pct: number) => {
    if (variant === 'emerald') return { primary: '#10b981', secondary: '#059669', bg: 'rgba(16, 185, 129, 0.15)' };
    if (variant === 'blue') return { primary: '#3b82f6', secondary: '#2563eb', bg: 'rgba(59, 130, 246, 0.15)' };
    if (variant === 'amber') return { primary: '#f59e0b', secondary: '#d97706', bg: 'rgba(245, 158, 11, 0.15)' };

    // Dynamic:
    if (pct >= 80) return { primary: '#10b981', secondary: '#059669', bg: 'rgba(16, 185, 129, 0.15)', name: 'emerald' };
    if (pct >= 50) return { primary: '#3b82f6', secondary: '#0284c7', bg: 'rgba(59, 130, 246, 0.15)', name: 'blue' };
    if (pct >= 25) return { primary: '#f59e0b', secondary: '#d97706', bg: 'rgba(245, 158, 11, 0.15)', name: 'amber' };
    return { primary: '#f43f5e', secondary: '#e11d48', bg: 'rgba(244, 63, 94, 0.15)', name: 'rose' };
  };

  const colors = getColor(clampedPercentage);

  const radius = Math.max(1, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (clampedPercentage / 100) * circumference);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Circular Arc with Animated Dashoffset */}
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg] transform origin-center drop-shadow-sm"
        >
          <defs>
            <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200/80 dark:text-slate-800/80"
          />

          {/* Animated Progress Track */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${uniqueId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: !isNaN(strokeDashoffset) ? strokeDashoffset : 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content: Percentage & Shifts count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-extrabold tracking-tight text-slate-800 dark:text-white"
            style={{ fontSize: size >= 140 ? '1.75rem' : size >= 100 ? '1.25rem' : '0.95rem' }}
          >
            {clampedPercentage}%
          </motion.span>
          
          <span
            className="font-medium text-slate-500 dark:text-slate-400 -mt-0.5"
            style={{ fontSize: size >= 140 ? '0.75rem' : '0.65rem' }}
          >
            {safeCompleted}/{safeTarget} Shift
          </span>
        </div>
      </div>

      {label && (
        <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}
      {subLabel && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {subLabel}
        </span>
      )}
    </div>
  );
};
