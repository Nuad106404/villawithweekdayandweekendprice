import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Booking } from '../../types/booking';
import { Button } from '../ui/button';
import { QRCode } from './QRCode';
import { toast } from 'react-toastify';

interface PaymentDetailsProps {
  booking: Booking;
}

export function PaymentDetails({ booking }: PaymentDetailsProps) {
  const { t } = useTranslation();
  const villa = useSelector((state: RootState) => state.villa.villa);
  const bankDetails = villa?.bankDetails || [];

  const totalPrice = booking?.bookingDetails?.totalPrice;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copied'));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* Total Amount Display */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('booking.payment.totalAmount')}
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              ฿{totalPrice?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Bank Transfer Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('booking.payment.bankTransfer')}
          </h3>
          
          <div className="space-y-4">
            {bankDetails.map((bank, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{bank.bank}</span>
                  <button
                    onClick={() => handleCopy(bank.accountNumber)}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm"
                  >
                    {t('common.copy')}
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{bank.accountName}</p>
                  <p>{bank.accountNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>{t('common.paymentDetails')}</p>
        </div>
      </div>
    </div>
  );
}