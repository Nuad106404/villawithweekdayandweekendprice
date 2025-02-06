import React from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, isAfter, startOfToday } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface DateRangePickerProps {
  selectedRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabledDates?: Array<{ from: Date; to: Date }>;
  className?: string;
}

export function DateRangePicker({
  selectedRange,
  onSelect,
  disabledDates = [],
  className = '',
}: DateRangePickerProps) {
  const { t, i18n } = useTranslation();
  const today = startOfToday();

  // Disable past dates and dates in disabled ranges
  const disabledDays = [
    { before: today },
    ...disabledDates,
  ];

  const formatDate = (date: Date) => {
    return format(date, 'PPP', {
      locale: i18n.language === 'th' ? th : enUS,
    });
  };

  const footer = selectedRange?.from ? (
    <div className="mt-3 text-sm">
      {selectedRange.to ? (
        <div className="flex items-center text-amber-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {formatDate(selectedRange.from)} – {formatDate(selectedRange.to)}
          </span>
        </div>
      ) : (
        <span className="text-gray-600">{t('booking.selectCheckout')}</span>
      )}
    </div>
  ) : (
    <span className="text-gray-600 text-sm">{t('booking.selectCheckin')}</span>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 w-full"
        >
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={onSelect}
            disabled={disabledDays}
            numberOfMonths={1}
            footer={footer}
            fromMonth={today}
            locale={i18n.language === 'th' ? th : enUS}
            formatters={{
              formatCaption: (date, options) => {
                return format(date, 'LLLL yyyy', {
                  locale: i18n.language === 'th' ? th : enUS,
                });
              },
            }}
            modifiers={{
              disabled: (date) => isAfter(today, date),
            }}
            showOutsideDays={false}
            className="w-full max-w-full"
            classNames={{
              months: "flex flex-col space-y-4 w-full",
              month: "w-full space-y-4",
              caption: "flex justify-center relative items-center h-10",
              caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center",
              row: "flex w-full mt-2",
              cell: "relative text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-amber-50 dark:[&:has([aria-selected])]:bg-amber-900/20 flex-1 p-0",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full inline-flex items-center justify-center mx-auto",
              day_selected: "bg-amber-500 text-white hover:bg-amber-600 hover:text-white focus:bg-amber-600 focus:text-white dark:bg-amber-500 dark:hover:bg-amber-600",
              day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              day_outside: "opacity-50 cursor-not-allowed",
              day_disabled: "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600",
              day_range_middle: "aria-selected:bg-amber-50 dark:aria-selected:bg-amber-900/20 aria-selected:text-amber-900 dark:aria-selected:text-amber-100",
              day_hidden: "invisible",
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}