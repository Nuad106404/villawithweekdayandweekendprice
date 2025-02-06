import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../lib/utils';

interface PriceBreakdownProps {
  breakdown: {
    basePrice: number;
    numberOfNights: number;
    discount?: number;
    discountedPrice?: number;
    total: number;
  };
}

export function PriceBreakdown({ breakdown }: PriceBreakdownProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 text-sm">
      {/* Total */}
      <div className="flex justify-between text-lg font-semibold">
        <span className="text-gray-900 dark:text-white">{t('booking.payment.totalAmount')}</span>
        <span className="text-amber-600 dark:text-amber-400">{formatPrice(breakdown.total)}</span>
      </div>
    </div>
  );
}