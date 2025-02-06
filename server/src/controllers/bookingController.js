import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';
import { createLogger } from '../utils/logger.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';

const logger = createLogger('booking-controller');

// Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    const {
      bookingDetails,
      paymentMethod
    } = req.body;

    // Set initial status to pending
    const bookingData = {
      bookingDetails,
      paymentMethod,
      status: 'pending'
    };

    // Check availability
    const isAvailable = await Booking.checkAvailability(bookingDetails.checkIn, bookingDetails.checkOut);
    if (!isAvailable) {
      throw new AppError('Selected dates are not available', 400);
    }

    const booking = await Booking.create(bookingData);
    logger.info(`New booking created with ID: ${booking._id}`);

    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single booking
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Update a booking
export const updateBooking = async (req, res, next) => {
  try {
    const { customerInfo } = req.body;
    const bookingId = req.params.id;

    // Validate customer info if provided
    if (customerInfo) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
        throw new AppError('All customer information fields are required', 400);
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerInfo.email)) {
        throw new AppError('Invalid email format', 400);
      }

      // Basic phone validation (allowing international formats)
      const phoneRegex = /^\+?[\d\s-]{8,}$/;
      if (!phoneRegex.test(customerInfo.phone)) {
        throw new AppError('Invalid phone number format', 400);
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a booking
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Upload payment slip
export const uploadPaymentSlip = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    booking.paymentSlipUrl = req.file.path;
    booking.status = 'pending_payment';
    await booking.save();

    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Send booking confirmation email
export const sendConfirmationEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Attempting to send confirmation email for booking ID: ${id}`);

    // Find the booking with all required fields
    const booking = await Booking.findById(id).select('+customerInfo +bookingDetails');
    if (!booking) {
      logger.error(`Booking not found with ID: ${id}`);
      throw new AppError('Booking not found', 404);
    }

    // Log booking data for debugging
    logger.info('Found booking:', {
      id: booking._id,
      customerInfo: booking.customerInfo,
      bookingDetails: booking.bookingDetails
    });

    // Send confirmation email
    await sendBookingConfirmationEmail(booking);

    logger.info(`Confirmation email sent successfully for booking ID: ${id}`);

    res.status(200).json({
      status: 'success',
      message: 'Confirmation email sent successfully'
    });
  } catch (error) {
    logger.error('Error in sendConfirmationEmail:', {
      message: error.message,
      stack: error.stack
    });
    next(error);
  }
};
