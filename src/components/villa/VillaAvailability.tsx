import React from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '../booking/DateRangePicker';

// Example blackout dates (in practice, these would come from an API)
const blackoutDates = [
  { from: new Date(2024, 2, 15), to: new Date(2024, 2, 20) },
  { from: new Date(2024, 3, 1), to: new Date(2024, 3, 5) },
];

export function VillaAvailability() {
  const [selectedRange, setSelectedRange] = React.useState<DateRange>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Check Availability</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select dates to check availability. Blocked dates are shown in gray.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <DateRangePicker
          selectedRange={selectedRange}
          onSelect={setSelectedRange}
          disabledDates={blackoutDates}
          className="mx-auto max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-amber-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Unavailable</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Available</span>
        </div>
      </div>
    </div>
  );
}