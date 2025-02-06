import React, { useEffect } from 'react';
import { MapPin, Users, Home, Star, Waves, Users2, Bath, BedDouble } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';
import { VillaSlideshow } from './VillaSlideshow';
import { fetchVillaDetails } from '../../store/slices/villaSlice';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function VillaDescription() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { villa } = useSelector((state: RootState) => state.villa);

  useEffect(() => {
    dispatch(fetchVillaDetails());
  }, [dispatch]);

  const getVillaBeachfront = () => {
    if (!villa?.beachfront) return t('villa.beachfront');
    const currentLang = i18n.language as 'en' | 'th';
    return villa.beachfront[currentLang] || villa.beachfront.en;
  };

  const getVillaDescription = () => {
    if (!villa?.description) return t('villa.description');
    const currentLang = i18n.language as 'en' | 'th';
    return villa.description[currentLang] || villa.description.en;
  };

  return (
    <div className="relative">
      {/* Hero Section with Slideshow */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 mb-12">
        <VillaSlideshow />
      </div>

      {/* Main Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
      >
        {/* Title Section */}
        <motion.div variants={item} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-amber-600">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-lg font-medium">4.9</span>
            <span className="text-gray-500 dark:text-gray-400">
              (128 {t('villa.reviewsstar')})
            </span>
          </div>
        </motion.div>

        {/* Villa Details */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Beachfront */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-start space-x-4">
            <MapPin className="w-8 h-8 text-amber-600 mb-4" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t('villa.location')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 flex-grow">
                {getVillaBeachfront()}
              </p>
            </div>
          </div>

          {/* Guests */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-start space-x-4">
            <Users2 className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t('villa.maxGuests')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('villa.guestsCount', { count: villa?.maxGuests || 6 })}
              </p>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-start space-x-4">
            <BedDouble className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t('villa.bedrooms')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('villa.bedroomsCount', { count: villa?.bedrooms || 3 })}
              </p>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-start space-x-4">
            <Bath className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t('villa.bathrooms')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('villa.bathroomsCount', { count: villa?.bathrooms || 3 })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Description Section */}
        <motion.div variants={item} className="mt-12">
          <h2 className="text-3xl font-semibold mb-6">
            {villa?.title?.[i18n.language as 'en' | 'th'] || villa?.title?.en || t('villa.aboutTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {getVillaDescription()}
          </p>
        </motion.div>
      </motion.div>

      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-amber-50 dark:bg-amber-900/20 blur-3xl opacity-20" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-amber-50 dark:bg-amber-900/20 blur-3xl opacity-20" />
      </div>
    </div>
  );
}