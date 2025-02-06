import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Users, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DateRange } from 'react-day-picker';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { bookingApi } from '../../services/api';
import { formatPrice } from '../../lib/utils';
import cn from 'classnames';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useBookingCalculator } from '../../hooks/useBookingCalculator';

export function BookingCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const villa = useSelector((state: RootState) => state.villa.villa);
  const maxRooms = villa?.bedrooms || 1;
  const minRooms = villa?.minRooms || 1;
  
  // Initialize rooms state with maxRooms
  const [rooms, setRooms] = React.useState(maxRooms);

  // Generate room options from min to max rooms
  const roomOptions = React.useMemo(() => {
    const options = [];
    for (let i = maxRooms; i >= minRooms; i--) {
      options.push(
        <option key={i} value={i}>
          {i} {t('booking.room', { count: i })}
        </option>
      );
    }
    return options;
  }, [maxRooms, minRooms, t]);

  // Update rooms when maxRooms changes
  React.useEffect(() => {
    setRooms(maxRooms);
  }, [maxRooms]);

  // Get prices from database
  const weekdayPrice = villa?.weekdayPrice || 0;
  const weekdayDiscountedPrice = villa?.weekdayDiscountedPrice || 0;
  const weekendPrice = villa?.weekendPrice || 0;
  const weekendDiscountedPrice = villa?.weekendDiscountedPrice || 0;
  const priceReductionPerRoom = villa?.priceReductionPerRoom || 0;

  // Calculate weekday and weekend nights
  const [weekdayNights, weekendNights] = React.useMemo(() => {
    if (!date?.from || !date?.to) return [0, 0];

    let weekdays = 0;
    let weekends = 0;
    let current = new Date(date.from);
    const end = new Date(date.to);

    while (current < end) {
      // 0 is Sunday, 5 is Friday, 6 is Saturday
      const day = current.getDay();
      if (day === 5 || day === 6) { // Friday or Saturday
        weekends++;
      } else { // Sunday to Thursday
        weekdays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return [weekdays, weekends];
  }, [date?.from, date?.to]);

  // Calculate adjusted prices with room reduction
  const adjustedWeekdayPrice = Math.max(weekdayPrice - (priceReductionPerRoom * (maxRooms - rooms)), 0);
  const adjustedWeekdayDiscountedPrice = weekdayDiscountedPrice > 0 
    ? Math.max(weekdayDiscountedPrice - (priceReductionPerRoom * (maxRooms - rooms)), 0)
    : 0;
    
  const adjustedWeekendPrice = Math.max(weekendPrice - (priceReductionPerRoom * (maxRooms - rooms)), 0);
  const adjustedWeekendDiscountedPrice = weekendDiscountedPrice > 0
    ? Math.max(weekendDiscountedPrice - (priceReductionPerRoom * (maxRooms - rooms)), 0)
    : 0;

  const totalNights = date?.from && date?.to
    ? Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate total price using discounted prices when available
  const totalPrice = React.useMemo(() => {
    if (!date?.from || !date?.to) return 0;
    const weekdayTotal = weekdayNights * (adjustedWeekdayDiscountedPrice || adjustedWeekdayPrice);
    const weekendTotal = weekendNights * (adjustedWeekendDiscountedPrice || adjustedWeekendPrice);
    return weekdayTotal + weekendTotal;
  }, [adjustedWeekdayPrice, adjustedWeekdayDiscountedPrice, adjustedWeekendPrice, adjustedWeekendDiscountedPrice, weekdayNights, weekendNights, date]);

  // Format price displays
  const formattedWeekdayPrice = formatPrice(weekdayPrice);
  const formattedWeekdayDiscountedPrice = weekdayDiscountedPrice > 0 ? formatPrice(weekdayDiscountedPrice) : '';
  const formattedWeekendPrice = formatPrice(weekendPrice);
  const formattedWeekendDiscountedPrice = weekendDiscountedPrice > 0 ? formatPrice(weekendDiscountedPrice) : '';
  const formattedTotalPrice = formatPrice(totalPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date?.from || !date?.to) {
      toast.error(t('booking.errors.selectDates'));
      return;
    }

    setIsLoading(true);
    try {
      const bookingData = {
        bookingDetails: {
          checkIn: date.from.toISOString(),
          checkOut: date.to.toISOString(),
          rooms: Number(rooms),
          totalPrice: Number(totalPrice)
        },
        paymentMethod: 'bank_transfer',
        specialRequests: ''
      };
      
      console.log('Sending booking data:', JSON.stringify(bookingData, null, 2));
      console.log('Date values:', {
        from: date.from,
        to: date.to,
        rooms: rooms,
        totalPrice: totalPrice,
        fromISO: date.from.toISOString(),
        toISO: date.to.toISOString()
      });
      
      const response = await bookingApi.createBooking(bookingData);
      
      if (response.status === 'success' && response.data?.booking) {
        // Navigate to customer info form with booking ID
        navigate(`/booking/${response.data.booking._id}/customer-info`);
      } else {
        console.error('Invalid response:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(t('booking.errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[450px] md:max-w-none mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="relative w-full sm:w-auto">
            {/* Price Container with Artistic Background */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 p-6">
              {/* Discount Badge */}
              {((date?.from && new Date(date.from).getDay() >= 0 && new Date(date.from).getDay() <= 6 && weekendDiscountedPrice > 0) ||
                (date?.from && new Date(date.from).getDay() >= 1 && new Date(date.from).getDay() <= 5 && weekdayDiscountedPrice > 0) ||
                (!date?.from && weekdayDiscountedPrice > 0)) && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                  {date?.from
                    ? (new Date(date.from).getDay() === 5 || new Date(date.from).getDay() === 6
                      ? `-${Math.round((1 - weekendDiscountedPrice / weekendPrice) * 100)}%`
                      : `-${Math.round((1 - weekdayDiscountedPrice / weekdayPrice) * 100)}%`)
                    : `-${Math.round((1 - weekdayDiscountedPrice / weekdayPrice) * 100)}%`
                  }
                </div>
              )}
              
              <div className="relative flex flex-col">
                {/* Price Display */}
                <div className="flex flex-col">
                  {/* Regular Price with Strikethrough */}
                  {((date?.from && new Date(date.from).getDay() >= 0 && new Date(date.from).getDay() <= 6 && weekendDiscountedPrice > 0) ||
                    (date?.from && new Date(date.from).getDay() >= 1 && new Date(date.from).getDay() <= 5 && weekdayDiscountedPrice > 0) ||
                    (!date?.from && weekdayDiscountedPrice > 0)) && (
                    <span className="text-lg text-gray-400 line-through mb-1">
                      {date?.from
                        ? (new Date(date.from).getDay() === 5 || new Date(date.from).getDay() === 6
                          ? formattedWeekendPrice
                          : formattedWeekdayPrice)
                        : formattedWeekdayPrice
                      }
                    </span>
                  )}
                  
                  {/* Current Price */}
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-amber-700">
                      {date?.from
                        ? (new Date(date.from).getDay() === 5 || new Date(date.from).getDay() === 6
                          ? (weekendDiscountedPrice > 0 ? formatPrice(weekendDiscountedPrice) : formattedWeekendPrice)
                          : (weekdayDiscountedPrice > 0 ? formatPrice(weekdayDiscountedPrice) : formattedWeekdayPrice))
                        : (weekdayDiscountedPrice > 0 ? formatPrice(weekdayDiscountedPrice) : formattedWeekdayPrice)
                      }
                    </span>
                    <span className="ml-2 text-amber-700/70">/ {t('common.perNight')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            <span>
              {rooms} {t('booking.room', { count: rooms })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">
              {t('booking.selectDates')}
            </h3>
            <div className="relative bg-gradient-to-br from-amber-50/50 to-amber-100/50 rounded-2xl p-3 sm:p-6">
              <div className="absolute inset-0 backdrop-blur-sm rounded-2xl"></div>
              <div className="relative">
                <Calendar
                  mode="range"
                  defaultMonth={new Date()}
                  selected={date}
                  onSelect={(range) => {
                    // Prevent same-day check-in/check-out
                    if (range?.from && range?.to && 
                        range.from.getTime() === range.to.getTime()) {
                      toast.error(t('booking.errors.sameDayBooking'));
                      return;
                    }
                    setDate(range);
                  }}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                  showOutsideDays={false}
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium text-gray-900 dark:text-white",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "inline-flex items-center justify-center rounded-md text-sm font-medium touch-manipulation",
                      "h-8 w-8 sm:h-7 sm:w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      "text-gray-800 hover:bg-gray-100",
                      "disabled:pointer-events-none disabled:opacity-50"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: cn(
                      "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                      "flex-1 text-center"
                    ),
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                      "flex-1 h-10 sm:h-9 items-center justify-center touch-manipulation"
                    ),
                    day: cn(
                      "inline-flex w-10 h-10 sm:w-9 sm:h-9 items-center justify-center rounded-full",
                      "text-gray-900 hover:bg-amber-100",
                      "aria-selected:opacity-100 hover:opacity-100 touch-manipulation"
                    ),
                    day_range_start: "day-range-start",
                    day_range_end: "day-range-end",
                    day_selected: cn(
                      "bg-amber-500 text-white hover:bg-amber-600"
                    ),
                    day_today: "bg-gray-100",
                    day_outside: "opacity-50",
                    day_disabled: "opacity-50 cursor-not-allowed",
                    day_range_middle: cn(
                      "aria-selected:bg-amber-100",
                      "aria-selected:text-gray-900"
                    ),
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: () => <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />,
                    IconRight: () => <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center sm:text-left">
              {t('booking.rooms')} ({t('common.max')} {maxRooms})
            </label>
            <div className="relative">
              <select
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors text-base sm:text-sm touch-manipulation"
              >
                {roomOptions}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          {totalNights > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4 border-t border-gray-200"
            >
              {/* Show price breakdown by weekday/weekend */}
              {date?.from && date?.to && (
                <div className="space-y-2">
                  {/* Weekday prices */}
                  {weekdayNights > 0 && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">
                        {t('booking.weekdayPrice')} × {weekdayNights} {t('common.nights')}
                      </span>
                      <div className="flex flex-col items-end">
                        {weekdayDiscountedPrice > 0 ? (
                          <>
                            <span className="text-sm text-gray-500 line-through">{formattedWeekdayPrice} / {t('common.night')}</span>
                            <div className="flex items-center gap-2">
                              <span>{formatPrice(weekdayDiscountedPrice * weekdayNights)}</span>
                              <span className="text-xs text-red-500 font-medium">
                                (-{Math.round((1 - weekdayDiscountedPrice / weekdayPrice) * 100)}%)
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-500">{formattedWeekdayPrice} / {t('common.night')}</span>
                            <span>{formatPrice(weekdayPrice * weekdayNights)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Weekend prices */}
                  {weekendNights > 0 && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">
                        {t('booking.weekendPrice')} × {weekendNights} {t('common.nights')}
                      </span>
                      <div className="flex flex-col items-end">
                        {weekendDiscountedPrice > 0 ? (
                          <>
                            <span className="text-sm text-gray-500 line-through">{formattedWeekendPrice} / {t('common.night')}</span>
                            <div className="flex items-center gap-2">
                              <span>{formatPrice(weekendDiscountedPrice * weekendNights)}</span>
                              <span className="text-xs text-red-500 font-medium">
                                (-{Math.round((1 - weekendDiscountedPrice / weekendPrice) * 100)}%)
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-500">{formattedWeekendPrice} / {t('common.night')}</span>
                            <span>{formatPrice(weekendPrice * weekendNights)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {rooms < maxRooms && priceReductionPerRoom > 0 && (
                <div className="flex justify-between text-sm sm:text-base text-green-600 mt-2">
                  <span>{t('common.youSave')}</span>
                  <span>{formatPrice((maxRooms - rooms) * priceReductionPerRoom * totalNights)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-base sm:text-lg text-gray-900 mt-3">
                <span>{t('common.total')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={!date?.from || !date?.to || isLoading}
            className={cn(
              "w-full h-14 sm:h-12 rounded-xl",
              "bg-gradient-to-r from-amber-500 to-amber-600",
              "hover:from-amber-600 hover:to-amber-700",
              "text-white font-medium text-base sm:text-sm",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center space-x-2",
              "touch-manipulation"
            )}
          >
            <span>{isLoading ? t('common.pleaseWait') : t('common.bookNow')}</span>
            <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}