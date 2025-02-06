import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [isHovered, setIsHovered] = React.useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative inline-flex items-center bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-full p-1 shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle language"
    >
      <motion.div
        className="absolute h-8 w-12 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full"
        initial={false}
        animate={{
          x: i18n.language === 'en' ? 44 : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <div className="relative grid grid-cols-2 w-24">
        <div className={`flex items-center justify-center h-8 w-12 z-10 transition-colors duration-200 ${
          i18n.language === 'th' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
        }`}>
          <span className="text-sm font-medium">TH</span>
        </div>
        <div className={`flex items-center justify-center h-8 w-12 z-10 transition-colors duration-200 ${
          i18n.language === 'en' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
        }`}>
          <span className="text-sm font-medium">EN</span>
        </div>
      </div>
    </motion.button>
  );
}