import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchVillaDetails } from '../../store/slices/villaSlice';
import { motion } from 'framer-motion';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { villa } = useSelector((state: RootState) => state.villa);

  useEffect(() => {
    dispatch(fetchVillaDetails());
  }, [dispatch]);

  const getVillaName = () => {
    if (!villa) return t('common.villa');
    const currentLang = i18n.language as 'en' | 'th';
    return villa.name[currentLang] || villa.name.en;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 w-full"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl backdrop-saturate-150" />
      
      <div className="relative container mx-auto">
        <div className="flex h-20 items-center justify-between">
          {/* Logo/Villa Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <h1 className="text-2xl font-medium tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {getVillaName()}
            </h1>
            <div className="absolute -bottom-1 left-0 w-1/2 h-[2px] bg-gradient-to-r from-gray-900 to-transparent dark:from-white dark:to-transparent opacity-20" />
          </motion.div>

          {/* Controls */}
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </motion.nav>
        </div>
      </div>
    </motion.header>
  );
};