import React from 'react';
import { 
  Wifi, 
  Waves as Pool, 
  Utensils as Kitchen, 
  Tv, 
  Coffee, 
  Wind, 
  Car, 
  Bath, 
  Dumbbell, 
  UtensilsCrossed as BBQ 
} from 'lucide-react';
import { motion } from 'framer-motion';

const amenities = [
  { icon: Pool, label: 'Private Pool' },
  { icon: Wifi, label: 'High-speed WiFi' },
  { icon: Kitchen, label: 'Full Kitchen' },
  { icon: Tv, label: 'Smart TV' },
  { icon: Coffee, label: 'Coffee Maker' },
  { icon: Wind, label: 'Air Conditioning' },
  { icon: Car, label: 'Free Parking' },
  { icon: Bath, label: 'Luxury Bathroom' },
  { icon: BBQ, label: 'BBQ Area' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function VillaAmenities() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {amenities.map(({ icon: Icon, label }) => (
        <motion.div
          key={label}
          variants={item}
          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-200"
        >
          <div className="flex-shrink-0">
            <Icon className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-gray-700 dark:text-gray-300">{label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}