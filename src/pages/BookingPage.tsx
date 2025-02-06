import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingSteps } from '../components/booking/BookingSteps';
import { CustomerInfoForm } from '../components/booking/CustomerInfoForm';
import { PaymentMethod } from '../components/booking/PaymentMethod';
import { BookingConfirmation } from '../components/booking/BookingConfirmation';
import type { BookingState, CustomerInfo } from '../types/booking';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingState, setBookingState] = React.useState<BookingState>(() => {
    // Initialize state from location or redirect
    if (!location.state?.bookingDetails) {
      navigate('/', { replace: true });
      return {
        step: 1,
        customerInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        },
        bookingDetails: null,
        paymentMethod: null,
        reservationId: null,
      };
    }

    return {
      step: 1,
      customerInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
      bookingDetails: location.state.bookingDetails,
      paymentMethod: null,
      reservationId: null,
    };
  });

  // Redirect if no booking details are present
  React.useEffect(() => {
    if (!bookingState.bookingDetails) {
      navigate('/', { replace: true });
    }
  }, [bookingState.bookingDetails, navigate]);

  const handleCustomerInfoSubmit = (data: CustomerInfo) => {
    setBookingState((prev) => ({
      ...prev,
      step: 2,
      customerInfo: data,
    }));
  };

  const handlePaymentMethodSelect = async (method: 'bank_transfer' | 'promptpay', slip: File) => {
    try {
      setBookingState((prev) => ({
        ...prev,
        paymentMethod: method,
      }));

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a unique reservation ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const reservationId = `RES${timestamp}${random}`.toUpperCase();

      setBookingState((prev) => ({
        ...prev,
        step: 3,
        reservationId,
      }));
    } catch (error) {
      console.error('Error processing payment:', error);
      // Handle payment error here
    }
  };

  if (!bookingState.bookingDetails) {
    return null; // or a loading state
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <BookingSteps currentStep={bookingState.step} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={bookingState.step}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 md:p-8">
              {bookingState.step === 1 && (
                <CustomerInfoForm onSubmit={handleCustomerInfoSubmit} />
              )}

              {bookingState.step === 2 && (
                <PaymentMethod
                  booking={bookingState}
                  onSelect={handlePaymentMethodSelect}
                />
              )}

              {bookingState.step === 3 && (
                <BookingConfirmation booking={bookingState} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default BookingPage;