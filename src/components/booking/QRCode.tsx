import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useTranslation } from 'react-i18next';

interface QRCodeProps {
  amount: number;
}

export function QRCode({ amount }: QRCodeProps) {
  const villa = useSelector((state: RootState) => state.villa.villa);
  const qrImage = villa?.promptPay?.qrImage;
  const { t } = useTranslation();

  // Ensure amount is a valid number
  const safeAmount = typeof amount === 'number' ? amount : 0;

  const handleDownload = () => {
    if (!qrImage) return;
    
    // Create a link element
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'promptpay-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!qrImage) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center space-y-4"
    >
      <div className="relative w-full max-w-[280px] aspect-square">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-xl" />
        <div className={cn(
          "relative w-full h-full",
          "bg-white dark:bg-gray-800",
          "rounded-2xl shadow-lg",
          "p-6 sm:p-8",
          "flex flex-col items-center justify-center",
          "space-y-4"
        )}>
          <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden">
            <img
              src={qrImage}
              alt="PromptPay QR Code"
              className="w-full h-full object-contain"
              style={{
                filter: 'contrast(1.1)',
                mixBlendMode: 'multiply'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-50/30 pointer-events-none" />
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">PromptPay</div>
            <div className="text-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
              {new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
              }).format(safeAmount)}
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleDownload}
        variant="outline"
        className={cn(
          "group relative",
          "w-full max-w-[280px]",
          "py-2 px-4",
          "bg-white/90 dark:bg-gray-800/90",
          "hover:bg-amber-50 dark:hover:bg-amber-900/20",
          "border-2 border-amber-500/20",
          "rounded-xl",
          "transition-all duration-300",
          "flex items-center justify-center space-x-2"
        )}
      >
        <Download className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {t('common.downloadqrcode')}
        </span>
      </Button>
    </motion.div>
  );
}