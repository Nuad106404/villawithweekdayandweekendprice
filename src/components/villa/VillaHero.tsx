import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useEffect } from 'react';
import { fetchVillaDetails } from '../../store/slices/villaSlice';

export function VillaHero() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { villa } = useSelector((state: RootState) => state.villa);

  useEffect(() => {
    dispatch(fetchVillaDetails());
  }, [dispatch]);

  const truncateText = (text: string, wordCount: number, isThai: boolean) => {
    if (isThai) {
      // For Thai, we'll count by characters since Thai doesn't use spaces
      const chars = text.split('');
      const truncated = chars.slice(0, 100).join(''); // Using 100 characters for Thai
      return truncated + (chars.length > 100 ? '...' : '');
    } else {
      // For English, we'll count by words
      const words = text.split(' ');
      return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
    }
  };

  const getVillaTitle = () => {
    if (!villa?.title) return t('villa.experienceLuxury');
    const currentLang = i18n.language as 'en' | 'th';
    return villa.title[currentLang] || villa.title.en;
  };

  const getVillaDescription = () => {
    if (!villa?.description) return t('villa.escapeDescription');
    const currentLang = i18n.language as 'en' | 'th';
    const description = villa.description[currentLang] || villa.description.en;
    return truncateText(description, 20, currentLang === 'th');
  };

  return (
    <div className="relative h-[80vh] lg:h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        {villa?.backgroundImage ? (
          <img
            src={villa.backgroundImage}
            alt="Villa background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70" />
      </div>
      <div className="relative h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="container h-full flex flex-col items-center justify-center text-center"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {getVillaTitle()}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
              {getVillaDescription()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}