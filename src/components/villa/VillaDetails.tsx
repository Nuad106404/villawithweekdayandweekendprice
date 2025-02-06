import React from 'react';
import { motion } from 'framer-motion';
import { VillaAmenities } from './VillaAmenities';
import { VillaDescription } from './VillaDescription';
import { VillaReviews } from './VillaReviews';
import { VillaRooms } from './VillaRooms';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

const tabs = [
  { id: 'description', label: 'villa.tabs.description' },
  { id: 'rooms', label: 'villa.tabs.rooms' },
  { id: 'amenities', label: 'villa.tabs.amenities' },
  { id: 'reviews', label: 'villa.tabs.reviews' },
] as const;

type TabId = typeof tabs[number]['id'];

export function VillaDetails() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<TabId>('description');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex space-x-8 px-6">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'py-4 relative text-sm font-medium whitespace-nowrap transition-colors duration-200',
                activeTab === id
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {t(label)}
              {activeTab === id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'description' && <VillaDescription />}
          {activeTab === 'rooms' && <VillaRooms />}
          {activeTab === 'amenities' && <VillaAmenities />}
          {activeTab === 'reviews' && <VillaReviews />}
        </motion.div>
      </div>
    </div>
  );
}