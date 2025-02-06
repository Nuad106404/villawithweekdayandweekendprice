import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
}

export function GlassCard({ 
  children, 
  variant = 'light',
  className,
  ...props 
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        'backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden',
        variant === 'light' 
          ? 'bg-white/30 dark:bg-white/10' 
          : 'bg-gray-900/30 dark:bg-gray-900/50',
        className
      )}
      {...props}
    >
      <div className="relative z-10 p-6">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5" />
    </motion.div>
  );
}