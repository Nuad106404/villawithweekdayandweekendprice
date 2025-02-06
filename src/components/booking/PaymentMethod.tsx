import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ArrowRight, ArrowLeft, CreditCard, QrCode } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { BookingSteps } from './BookingSteps';
import { Button } from '../ui/button';
import { QRCode } from './QRCode';
import { PaymentDetails } from './PaymentDetails';
import { SlipUpload } from './SlipUpload';
import cn from 'classnames';
import { BookingLayout } from './BookingLayout';
import { motion } from 'framer-motion';
import { CountdownTimer } from './CountdownTimer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export function PaymentMethod() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [booking, setBooking] = React.useState(null);
  const [selectedMethod, setSelectedMethod] = React.useState<'bank_transfer' | 'promptpay'>(
    () => {
      const villa = (window as any).__INITIAL_STATE__?.villa?.villa;
      if (villa?.bankDetails?.length > 0) return 'bank_transfer';
      if (villa?.promptPay?.qrImage) return 'promptpay';
      return 'bank_transfer';
    }
  );
  const [paymentSlipUrl, setPaymentSlipUrl] = React.useState<string>('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = React.useState(false);

  const villa = useSelector((state: RootState) => state.villa.villa);
  const hasPromptPay = !!villa?.promptPay?.qrImage;
  const hasBankDetails = villa?.bankDetails && villa.bankDetails.length > 0;

  // Set default payment method based on availability
  React.useEffect(() => {
    if (!hasBankDetails && hasPromptPay) {
      setSelectedMethod('promptpay');
    } else if (hasBankDetails && !hasPromptPay) {
      setSelectedMethod('bank_transfer');
    }
  }, [hasBankDetails, hasPromptPay]);

  React.useEffect(() => {
    async function fetchBooking() {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const response = await bookingApi.getBooking(id);
        if (!response?.data?.booking) {
          toast.error(t('booking.errors.notFound'));
          navigate('/');
          return;
        }
        setBooking(response.data.booking);
        // If booking has payment slip, set confirmed state
        if (response.data.booking.paymentSlipUrl) {
          setPaymentSlipUrl(response.data.booking.paymentSlipUrl);
          setIsPaymentConfirmed(true);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error(t('booking.errors.fetchFailed'));
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [id, navigate, t]);

  if (isLoading) {
    return (
      <BookingLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      </BookingLayout>
    );
  }

  if (!booking) {
    return (
      <BookingLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('booking.errors.notFound')}
          </h2>
          <Button onClick={() => navigate('/')} variant="outline">
            {t('common.backToHome')}
          </Button>
        </div>
      </BookingLayout>
    );
  }

  const handlePaymentMethodSelect = (method: 'bank_transfer' | 'promptpay') => {
    setSelectedMethod(method);
  };

  const handleFileSelect = (file: File) => {
    if (isPaymentConfirmed) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSlipUpload = async (file: File) => {
    try {
      setIsLoading(true);

      // Upload the slip
      const uploadResponse = await bookingApi.uploadPaymentSlip(file);
      
      if (!uploadResponse.status === 'success' || !uploadResponse.url) {
        throw new Error('Failed to upload slip');
      }

      // Update booking with slip URL only
      await bookingApi.updatePaymentDetails(id!, uploadResponse.url);
      
      setPaymentSlipUrl(uploadResponse.url);
      setIsPaymentConfirmed(true);
      toast.success(t('booking.payment.slipUploaded'));
      
      // Navigate to confirmation page
      navigate(`/booking/${id}/confirmation`);
    } catch (error) {
      console.error('Error uploading slip:', error);
      toast.error(t('booking.errors.uploadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedFile || isPaymentConfirmed) return;

    handleSlipUpload(selectedFile);
  };

  return (
    <BookingLayout>
      <BookingSteps currentStep={2} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
      >
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
          </div>

          {/* Main content */}
          <div className="relative space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4"
              >
                {t('booking.payment.selectMethod')}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 dark:text-gray-400 text-lg"
              >
                {t('booking.payment.choosePreferred')}
              </motion.p>
              {booking && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <CountdownTimer
                    startTime={new Date(booking.createdAt)}
                    endTime={new Date(booking.expiresAt)}
                    onExpire={() => {
                      toast.error(t('booking.errors.expired'));
                      navigate('/');
                    }}
                  />
                </motion.div>
              )}
            </div>

            {/* Payment method selection */}
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={cn(
                "grid gap-4 sm:gap-6",
                (hasBankDetails && hasPromptPay) 
                  ? "grid-cols-1 sm:grid-cols-2" 
                  : "grid-cols-1 max-w-md mx-auto w-full"
              )}
            >
              {hasBankDetails && (
                <Button
                  type="button"
                  variant={selectedMethod === 'bank_transfer' ? 'default' : 'outline'}
                  onClick={() => handlePaymentMethodSelect('bank_transfer')}
                  className={cn(
                    "group relative",
                    "min-h-[100px] sm:min-h-[160px]",
                    "p-3 sm:p-6",
                    "rounded-xl sm:rounded-2xl",
                    "transition-all duration-500",
                    "backdrop-blur-xl backdrop-filter",
                    "hover:scale-[1.02] hover:shadow-xl",
                    "border",
                    selectedMethod === 'bank_transfer' 
                      ? "bg-white/95 dark:bg-gray-800/95 border-amber-500 shadow-md shadow-amber-500/20" 
                      : "bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50",
                    "overflow-hidden"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 h-[70%] flex flex-col justify-between">
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                        <h3 className="font-semibold text-sm sm:text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                          {t('booking.payment.bankTransfer')}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {t('booking.payment.bankTransferDesc')}
                      </p>
                    </div>
                  </div>
                </Button>
              )}
              {hasPromptPay && (
                <Button
                  type="button"
                  variant={selectedMethod === 'promptpay' ? 'default' : 'outline'}
                  onClick={() => handlePaymentMethodSelect('promptpay')}
                  className={cn(
                    "group relative",
                    "min-h-[100px] sm:min-h-[160px]",
                    "p-3 sm:p-6",
                    "rounded-xl sm:rounded-2xl",
                    "transition-all duration-500",
                    "backdrop-blur-xl backdrop-filter",
                    "hover:scale-[1.02] hover:shadow-xl",
                    "border",
                    selectedMethod === 'promptpay' 
                      ? "bg-white/95 dark:bg-gray-800/95 border-amber-500 shadow-md shadow-amber-500/20" 
                      : "bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50",
                    "overflow-hidden"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 h-[70%] flex flex-col justify-between">
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                        <h3 className="font-semibold text-sm sm:text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                          {t('booking.payment.promptPay')}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {t('booking.payment.promptPayDesc')}
                      </p>
                    </div>
                  </div>
                </Button>
              )}
            </motion.div>

            {/* Payment details section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <div className={cn(
                "relative w-full max-w-3xl mx-auto",
                "bg-white/95 dark:bg-gray-800/95",
                "rounded-3xl shadow-2xl shadow-amber-500/10",
                "p-8 md:p-10",
                "backdrop-blur-xl",
                "border-2 border-gray-100 dark:border-gray-700/50"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent rounded-3xl" />
                
                <div className="relative space-y-8">
                  {selectedMethod === 'promptpay' ? (
                    <div className="space-y-8">
                      {booking?.bookingDetails?.totalPrice && (
                        <QRCode amount={booking.bookingDetails.totalPrice} />
                      )}
                      
                      <div className="w-full max-w-md mx-auto">
                        <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl p-6">
                          <h4 className="font-medium text-lg text-gray-900 dark:text-white mb-4">
                            {t('booking.payment.instructions')}
                          </h4>
                          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                            <li>{t('booking.payment.step1')}</li>
                            <li>{t('booking.payment.step2')}</li>
                            <li>{t('booking.payment.step3')}</li>
                            <li>{t('booking.payment.step4')}</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Bank Transfer Details */}
                      <PaymentDetails booking={booking} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Slip upload section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="space-y-8">
                <div className={cn(
                  "bg-white/95 dark:bg-gray-800/95",
                  "rounded-3xl p-8",
                  "shadow-xl shadow-amber-500/10",
                  "backdrop-blur-xl",
                  "border-2 border-gray-100 dark:border-gray-700/50"
                )}>
                  {isPaymentConfirmed ? (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {t('booking.slip.uploaded')}
                      </h3>
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
                        <img
                          src={paymentSlipUrl}
                          alt={t('booking.slip.upload.title')}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('booking.slip.cantChange')}
                      </p>
                    </div>
                  ) : (
                    <SlipUpload
                      onUpload={handleFileSelect}
                      onRemove={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      uploadedFile={selectedFile}
                      previewUrl={previewUrl}
                    />
                  )}
                </div>

                {selectedFile && !isPaymentConfirmed && (
                  <div className={cn(
                    "bg-white/95 dark:bg-gray-800/95",
                    "rounded-3xl p-8",
                    "shadow-xl shadow-amber-500/10",
                    "backdrop-blur-xl",
                    "border-2 border-gray-100 dark:border-gray-700/50"
                  )}>
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
                      <img
                        src={previewUrl}
                        alt={t('booking.slip.upload.title')}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Actions */}
                <div className="space-y-6">
                  {!isPaymentConfirmed ? (
                    <Button
                      onClick={handleConfirmPayment}
                      disabled={isLoading || !selectedFile}
                      className={cn(
                        "w-full h-14 text-lg font-medium",
                        "bg-gradient-to-r from-amber-500 to-amber-600",
                        "hover:from-amber-600 hover:to-amber-700",
                        "transition-all duration-300",
                        "rounded-2xl",
                        "shadow-lg shadow-amber-500/20",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      ) : (
                        t('booking.payment.confirm')
                      )}
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={() => navigate(`/booking/${id}`)}
                        variant="outline"
                        className={cn(
                          "w-full h-14 text-lg font-medium",
                          "flex items-center justify-center gap-3",
                          "rounded-2xl",
                          "border-2 border-gray-200 dark:border-gray-700",
                          "hover:border-amber-500 hover:text-amber-600",
                          "transition-all duration-300"
                        )}
                      >
                        <ArrowLeft className="w-5 h-5" />
                        {t('common.previous')}
                      </Button>
                      <Button
                        onClick={() => navigate(`/booking/${id}/confirmation`)}
                        className={cn(
                          "w-full h-14 text-lg font-medium",
                          "flex items-center justify-center gap-3",
                          "bg-gradient-to-r from-amber-500 to-amber-600",
                          "hover:from-amber-600 hover:to-amber-700",
                          "rounded-2xl",
                          "shadow-lg shadow-amber-500/20",
                          "transition-all duration-300"
                        )}
                      >
                        {t('common.next')}
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </BookingLayout>
  );
}