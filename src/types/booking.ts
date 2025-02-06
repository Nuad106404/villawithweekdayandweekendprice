export interface BookingDetails {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
}

export interface BookingCalculation {
  numberOfNights: number;
  basePrice: number;
  total: number;
  taxes: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingState {
  step: number;
  customerInfo: CustomerInfo;
  bookingDetails: BookingDetails;
  paymentMethod: 'bank_transfer' | 'promptpay' | null;
  reservationId: string | null;
}

export interface Booking {
  _id: string;
  customerInfo: CustomerInfo;
  bookingDetails: BookingDetails;
  status: 'pending' | 'pending_payment' | 'in_review' | 'confirmed' | 'cancelled' | 'expired';
  paymentMethod: 'bank_transfer' | 'promptpay' | null;
  paymentSlipUrl?: string;
  expiresAt: Date;
  canExpire: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = Booking['status'];
export type PaymentMethod = Booking['paymentMethod'];