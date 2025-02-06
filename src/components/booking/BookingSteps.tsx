import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Check, User, CreditCard, CheckCircle } from 'lucide-react';

interface BookingStepsProps {
  currentStep: number;
}

export function BookingSteps({ currentStep }: BookingStepsProps) {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();

  const steps = [
    {
      icon: User,
      label: t('booking.steps.customerInfo'),
      description: t('booking.steps.customerInfoDesc'),
      path: id ? `/booking/${id}` : '/booking',
    },
    {
      icon: CreditCard,
      label: t('booking.steps.payment.title'),
      description: t('booking.steps.paymentDesc'),
      path: id ? `/booking/${id}/payment` : '/booking/payment',
    },
    {
      icon: CheckCircle,
      label: t('booking.steps.confirmation.title'),
      description: t('booking.steps.confirmationDesc'),
      path: id ? `/booking/${id}/confirmation` : '/booking/confirmation',
    }
  ];

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 mt-16 sm:mt-20 md:mt-24">
      <div className="flex justify-between relative max-w-4xl mx-auto">
        {/* Progress Line for Mobile */}
        <div className="absolute top-4 sm:top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 sm:hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            className="h-full bg-amber-500 dark:bg-amber-400"
            transition={{ duration: 0.5 }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;
          const isActive = currentStep >= index + 1;

          return (
            <React.Fragment key={index}>
              <div className={cn(
                "flex flex-col items-center relative z-10",
                "w-full sm:w-auto",
                index !== 0 && "pl-2 sm:pl-4 md:pl-6"
              )}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center",
                    "transition-colors duration-200 shadow-sm",
                    isCompleted
                      ? "bg-amber-100 dark:bg-amber-900"
                      : isActive
                      ? "bg-amber-100 dark:bg-amber-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Icon className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5",
                      isActive
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-gray-400 dark:text-gray-500"
                    )} />
                  )}
                </motion.div>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.1 }}
                  className="mt-2 text-center max-w-[80px] xs:max-w-[90px] sm:max-w-none"
                >
                  <p className={cn(
                    "text-[11px] xs:text-xs sm:text-sm md:text-base font-medium truncate sm:whitespace-normal",
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.label}
                  </p>
                  <p className={cn(
                    "text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400",
                    "mt-0.5 sm:mt-1",
                    "hidden sm:block"
                  )}>
                    {step.description}
                  </p>
                </motion.div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 hidden sm:flex items-center px-2 md:px-4">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2 + 0.2 }}
                    className={cn(
                      "h-0.5 w-full origin-left",
                      currentStep > index + 1
                        ? "bg-amber-500 dark:bg-amber-400"
                        : isActive
                        ? "bg-amber-200 dark:bg-amber-700"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}