import { z } from 'zod';

export const customerInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Invalid phone number'),
});

export const bookingDetailsSchema = z.object({
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1).max(6),
  totalPrice: z.number().positive(),
});

export const paymentMethodSchema = z.enum(['bank_transfer', 'promptpay']);

export type CustomerInfo = z.infer<typeof customerInfoSchema>;
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;