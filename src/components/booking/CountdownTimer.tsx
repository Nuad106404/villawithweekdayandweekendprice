import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  startTime: Date | string;
  endTime: Date | string;
  onExpire?: () => void;
}

export function CountdownTimer({ startTime, endTime, onExpire }: CountdownTimerProps) {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  const { hours, minutes, seconds, isExpired } = useCountdownTimer({
    startTime: start,
    endTime: end
  });
  
  const { t } = useTranslation();

  useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  return (
    <AnimatePresence mode="wait">
      {isExpired ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium">
              {t('booking.payment.timeRemaining.expired')}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {t('booking.payment.timeRemaining.title')}
            </h4>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <TimeUnit
              value={hours}
              label={t('booking.payment.timeRemaining.hours')}
            />
            <TimeUnit
              value={minutes}
              label={t('booking.payment.timeRemaining.minutes')}
            />
            <TimeUnit
              value={seconds}
              label={t('booking.payment.timeRemaining.seconds')}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-amber-600 dark:text-amber-400"
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <div className="text-xs text-amber-700 dark:text-amber-300">
        {label}
      </div>
    </div>
  );
}