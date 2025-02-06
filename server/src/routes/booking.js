import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Validation middleware
const validateBooking = [
  body('bookingDetails')
    .isObject()
    .withMessage('Booking details are required'),
  body('bookingDetails.checkIn')
    .isISO8601()
    .withMessage('Invalid check-in date format')
    .custom((value, { req }) => {
      const checkIn = new Date(value);
      const now = new Date();
      if (isNaN(checkIn.getTime())) {
        throw new Error('Invalid check-in date');
      }
      if (checkIn < now) {
        throw new Error('Check-in date must be in the future');
      }
      return true;
    }),
  body('bookingDetails.checkOut')
    .isISO8601()
    .withMessage('Invalid check-out date format')
    .custom((value, { req }) => {
      const checkOut = new Date(value);
      const checkIn = new Date(req.body.bookingDetails.checkIn);
      if (isNaN(checkOut.getTime())) {
        throw new Error('Invalid check-out date');
      }
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('bookingDetails.rooms')
    .isInt({ min: 1 })
    .withMessage('Number of rooms must be at least 1')
    .toInt(),
  body('bookingDetails.totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number')
    .toFloat(),
  body('paymentMethod')
    .isIn(['bank_transfer', 'promptpay'])
    .withMessage('Invalid payment method'),
  body('specialRequests')
    .optional()
    .isString()
    .trim()
];

// Create a new booking
router.post('/', validateBooking, async (req, res) => {
  try {
    console.log('Received booking request:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array();
      console.log('Express validation errors:', JSON.stringify(validationErrors, null, 2));
      return res.status(400).json({
        status: 'error',
        message: validationErrors[0].msg,
        errors: validationErrors
      });
    }

    const { bookingDetails, paymentMethod, specialRequests } = req.body;

    // Create booking without saving
    const booking = new Booking({
      bookingDetails: {
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        rooms: bookingDetails.rooms,
        totalPrice: bookingDetails.totalPrice
      },
      paymentMethod,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Run validation manually to get any async validation errors
    try {
      const validationError = booking.validateSync();
      if (validationError) {
        console.error('Mongoose validation error:', validationError);
        return res.status(400).json({
          status: 'error',
          message: validationError.message,
          errors: Object.values(validationError.errors || {}).map(err => ({
            msg: err.message,
            path: err.path
          }))
        });
      }
    } catch (error) {
      console.error('Error during validation:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message,
        errors: [{ msg: error.message }]
      });
    }

    // Check availability
    const isAvailable = await Booking.checkAvailability(
      new Date(bookingDetails.checkIn),
      new Date(bookingDetails.checkOut)
    );

    if (!isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Selected dates are not available',
        errors: [{
          msg: 'Selected dates are not available',
          path: 'bookingDetails.checkIn'
        }]
      });
    }

    // Save the booking
    try {
      await booking.save();
      console.log('Booking saved successfully:', booking._id);
      
      res.status(201).json({
        status: 'success',
        data: {
          _id: booking._id,
          bookingDetails: booking.bookingDetails,
          status: booking.status,
          canExpire: booking.canExpire,
          createdAt: booking.createdAt,
          expiresAt: booking.expiresAt
        }
      });
    } catch (saveError) {
      console.error('Error saving booking:', saveError);
      return res.status(400).json({
        status: 'error',
        message: saveError.message,
        errors: Object.values(saveError.errors || {}).map(err => ({
          msg: err.message,
          path: err.path
        }))
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred',
      details: error.message
    });
  }
});

// Get all bookings (admin only)
router.get('/admin', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

// Get user's bookings
router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    booking.status = status;
    if (status === 'cancelled') {
      await booking.cancel();
    }

    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status'
    });
  }
});

// Update payment status (admin only)
router.patch('/:id/payment', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const { paymentStatus } = req.body;
    if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment status'
    });
  }
});

// Update payment details
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentSlipUrl } = req.body;

    // Validate payment method
    if (!['bank_transfer', 'promptpay'].includes(paymentMethod)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment method'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Update payment details
    booking.paymentMethod = paymentMethod;
    if (paymentSlipUrl) {
      booking.paymentSlipUrl = paymentSlipUrl;
      booking.status = 'in_review'; // Change status when slip is uploaded
    }

    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating payment details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating payment details'
    });
  }
});

// Cancel booking (user or admin)
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to cancel
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await booking.cancel();
    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking,
        refundAmount: booking.calculateRefundAmount()
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel booking'
    });
  }
});

// Delete a booking (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    await booking.remove();
    res.json({
      status: 'success',
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete booking'
    });
  }
});

export default router;
