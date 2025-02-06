export const PAYMENT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const STORAGE_KEYS = {
  THEME: 'theme',
  TIMER: 'booking_timer',
  BOOKING: 'current_booking',
} as const;

export const MAX_GUESTS = 6;
export const MIN_GUESTS = 1;
export const BASE_PRICE = 299;

export const BANK_DETAILS = {
  name: 'Kasikorn Bank',
  accountName: 'Luxury Villa Co., Ltd.',
  accountNumber: '123-4-56789-0',
  swiftCode: 'KASITHBK',
} as const;

export const PROMPTPAY_ID = '1234567890123';

export const ROUTES = {
  HOME: '/',
  BOOKING: '/booking',
  CONFIRMATION: '/confirmation',
} as const;