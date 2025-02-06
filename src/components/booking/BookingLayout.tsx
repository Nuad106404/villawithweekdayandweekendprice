import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: "easeOut"
    }
  }
};

interface BookingLayoutProps {
  children: React.ReactNode;
}

export function BookingLayout({ children }: BookingLayoutProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-white to-amber-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 dark:bg-amber-900 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200 dark:bg-amber-900 rounded-full filter blur-3xl opacity-20" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
