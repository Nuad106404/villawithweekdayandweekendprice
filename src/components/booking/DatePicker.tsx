import React from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, isWithinInterval, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';
import { BookingDate } from '../../types';

interface DatePickerProps {
  selectedRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
}

// Example blackout dates (you would typically fetch these from an API)
const blackoutDates = [
  { from: new Date(2024, 2, 15), to: new Date(2024, 2, 20) },
  { from: new Date(2024, 3, 1), to: new Date(2024, 3, 5) },
];

export function DatePicker({ selectedRange, onSelect }: DatePickerProps) {
  const disabledDays = [
    { before: new Date() },
    ...blackoutDates,
  ];

  const footer = selectedRange?.from ? (
    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
      {selectedRange.to ? (
        <>
          <Calendar className="inline-block w-4 h-4 mr-1" />
          {format(selectedRange.from, 'PPP')} - {format(selectedRange.to, 'PPP')}
        </>
      ) : (
        'Please select an end date.'
      )}
    </div>
  ) : (
    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
      Please select a start date.
    </div>
  );

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={onSelect}
        disabled={disabledDays}
        numberOfMonths={2}
        footer={footer}
        className="!font-sans"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center relative items-center h-10",
          caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem] flex-1",
          row: "flex w-full mt-2",
          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-800 flex-1",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md inline-flex items-center justify-center",
          day_selected: "bg-primary-600 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-600 focus:text-white",
          day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
          day_outside: "opacity-50",
          day_disabled: "opacity-50 cursor-not-allowed",
          day_range_middle: "aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800 aria-selected:text-gray-900 dark:aria-selected:text-gray-100",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}