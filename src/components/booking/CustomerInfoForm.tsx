import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { BookingSteps } from './BookingSteps';
import { BookingLayout } from './BookingLayout';
import { toast } from 'react-toastify';
import { bookingApi } from '../../services/api';
import type { CustomerInfo } from '../../types/booking';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export function CustomerInfoForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [booking, setBooking] = React.useState(null);
  const [activeField, setActiveField] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const [formData, setFormData] = React.useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = React.useState<Partial<Record<keyof CustomerInfo, string>>>({});

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    async function fetchBooking() {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const response = await bookingApi.getBooking(id);
        if (!response || !response.data?.booking) {
          toast.error(t('booking.errors.notFound'));
          navigate('/');
          return;
        }
        const bookingData = response.data.booking;
        setBooking(bookingData);
        if (bookingData.customerInfo) {
          setFormData(bookingData.customerInfo);
          setIsSubmitted(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const errors: Partial<Record<keyof CustomerInfo, string>> = {};
    if (!formData.firstName.trim()) errors.firstName = t('booking.errors.required');
    if (!formData.lastName.trim()) errors.lastName = t('booking.errors.required');
    if (!formData.email.trim()) errors.email = t('booking.errors.required');
    if (!formData.phone.trim()) errors.phone = t('booking.errors.required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = t('booking.errors.invalidEmail');
    }
    
    // Phone validation (accepting international formats)
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = t('booking.errors.invalidPhone');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await bookingApi.updateCustomerInfo(id!, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim()
      });

      if (response.status === 'success') {
        setIsSubmitted(true);
        toast.success(t('booking.success.customerInfo'));
        // Navigate to payment page after successful update
        navigate(`/booking/${id}/payment`);
      } else {
        throw new Error(response.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating customer info:', error);
      toast.error(error.message || t('booking.errors.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (id: keyof CustomerInfo, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleBack = () => {
    navigate(`/booking/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!booking) return null;

  const formFields = [
    {
      id: 'firstName' as const,
      label: t('booking.form.firstName'),
      placeholder: t('booking.form.enterFirstName'),
      icon: User,
      type: 'text',
      required: true
    },
    {
      id: 'lastName' as const,
      label: t('booking.form.lastName'),
      placeholder: t('booking.form.enterLastName'),
      icon: User,
      type: 'text',
      required: true
    },
    {
      id: 'email' as const,
      label: t('booking.form.email'),
      placeholder: t('booking.form.enterEmail'),
      icon: Mail,
      type: 'email',
      required: true
    },
    {
      id: 'phone' as const,
      label: t('booking.form.phone'),
      placeholder: t('booking.form.enterPhone'),
      icon: Phone,
      type: 'tel',
      required: true
    }
  ];

  const BookingSummary = () => (
    <motion.div
      variants={itemVariants}
      className={`
        relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl
        ${isMobile ? 'mt-8 p-6' : 'p-8'}
      `}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 dark:bg-amber-900 rounded-full filter blur-3xl opacity-20" />
      
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {t('booking.summary.title')}
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">
            {t('booking.summary.dates')}
          </span>
          <span className="font-medium text-right">
            {new Date(booking.bookingDetails.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(booking.bookingDetails.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">
            {t('booking.summary.guests')}
          </span>
          <span className="font-medium">
            {booking.bookingDetails.guests} {booking.bookingDetails.guests === 1 ? t('common.guest') : t('common.guests')}
          </span>
        </div>

        <div className="flex justify-between items-center pt-4">
          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            {t('booking.summary.total')}
          </span>
          <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
            {new Intl.NumberFormat('th-TH', {
              style: 'currency',
              currency: 'THB'
            }).format(booking.bookingDetails.totalPrice)}
          </span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-gray-700 rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('booking.summary.description')}
        </p>
      </div>
    </motion.div>
  );

  return (
    <BookingLayout>
      <BookingSteps currentStep={1} />
      
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('booking.customerInfo.title')}
          </h2>
          {booking && (
            <div className="backdrop-blur-sm bg-white/30 dark:bg-black/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    {t('booking.checkIn')}
                  </p>
                  <p className="text-lg font-light text-gray-900 dark:text-white">
                    {new Date(booking.bookingDetails.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    {t('booking.checkOut')}
                  </p>
                  <p className="text-lg font-light text-gray-900 dark:text-white">
                    {new Date(booking.bookingDetails.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    {t('booking.rooms')}
                  </p>
                  <p className="text-lg font-light text-gray-900 dark:text-white">
                    {booking.bookingDetails.rooms}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    {t('booking.price.total')}
                  </p>
                  <p className="text-lg font-light text-gray-900 dark:text-white">
                    ฿{booking.bookingDetails.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            {t('booking.customerInfo.subtitle')}
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('booking.customerInfo.title')}
              </h3>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <Check className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{t('booking.customerInfo.submitted')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('booking.form.firstName')}
                  </label>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {formData.firstName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('booking.form.lastName')}
                  </label>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {formData.lastName}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('booking.form.email')}
                </label>
                <div className="text-gray-900 dark:text-white font-medium">
                  {formData.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('booking.form.phone')}
                </label>
                <div className="text-gray-900 dark:text-white font-medium">
                  {formData.phone}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t('booking.customerInfo.cantChange')}
            </p>

            <Button
              onClick={() => navigate(`/booking/${id}/payment`)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              {t('common.next')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {formFields.map((field) => (
                <motion.div
                  key={field.id}
                  variants={itemVariants}
                  className="mb-6 last:mb-0"
                >
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <field.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      value={formData[field.id]}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`
                        block w-full pl-10 py-2.5 sm:text-sm rounded-lg
                        dark:bg-gray-700 dark:text-white dark:border-gray-600
                        ${formErrors[field.id] 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                        }
                        transition-colors duration-200
                      `}
                      placeholder={field.placeholder}
                    />
                    {formErrors[field.id] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                      >
                        {formErrors[field.id]}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex items-center space-x-4 pt-4 sm:pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="
                  w-full h-12 sm:h-14 
                  text-sm sm:text-base
                  bg-gradient-to-r from-amber-500 to-amber-600 
                  hover:from-amber-600 hover:to-amber-700
                "
              >
                {isLoading ? t('common.pleaseWait') : t('common.continue')}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </BookingLayout>
  );
}