import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { differenceInDays, addDays, isWeekend, eachDayOfInterval } from 'date-fns';

interface BookingCalculation {
  numberOfNights: number;
  weekdayNights: number;
  weekendNights: number;
  weekdayTotal: number;
  weekendTotal: number;
  basePrice: number;
  taxes: number;
  total: number;
}

export function useBookingCalculator(
  dateRange: DateRange | undefined,
  weekdayPrice: number,
  weekendPrice: number,
  taxRate: number = 0.12
): BookingCalculation {
  return useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return {
        numberOfNights: 0,
        weekdayNights: 0,
        weekendNights: 0,
        weekdayTotal: 0,
        weekendTotal: 0,
        basePrice: 0,
        taxes: 0,
        total: 0,
      };
    }

    // Get all dates in the range
    const dates = eachDayOfInterval({
      start: dateRange.from,
      end: addDays(dateRange.to, -1) // Exclude checkout day
    });

    // Count weekday and weekend nights
    const weekendNights = dates.filter(date => isWeekend(date)).length;
    const weekdayNights = dates.length - weekendNights;
    const numberOfNights = weekdayNights + weekendNights;

    // Calculate totals
    const weekdayTotal = weekdayNights * weekdayPrice;
    const weekendTotal = weekendNights * weekendPrice;
    const basePrice = weekdayTotal + weekendTotal;
    const taxes = Math.round(basePrice * taxRate);
    const total = basePrice + taxes;

    return {
      numberOfNights,
      weekdayNights,
      weekendNights,
      weekdayTotal,
      weekendTotal,
      basePrice,
      taxes,
      total,
    };
  }, [dateRange, weekdayPrice, weekendPrice, taxRate]);
}