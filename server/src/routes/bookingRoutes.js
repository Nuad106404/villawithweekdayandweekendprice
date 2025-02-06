import express from 'express';
import { 
  createBooking, 
  getBooking, 
  cancelBooking, 
  uploadPaymentSlip, 
  getAllBookings,
  sendConfirmationEmail 
} from '../controllers/bookingController.js';
import authAdmin from '../middleware/authAdmin.js';
import { upload } from '../middleware/uploadMiddleware.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Admin routes (keep authentication)
router.get('/all', authAdmin, getAllBookings);
router.post('/:id/send-confirmation', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Send confirmation email
    await sendConfirmationEmail(req, res);

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending confirmation email'
    });
  }
});

// Public booking routes (no authentication)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching booking'
    });
  }
});
router.post('/', createBooking);
router.post('/:id/cancel', cancelBooking);
router.post('/:id/upload-slip', upload.single('slip'), uploadPaymentSlip);

// Update booking
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentSlipUrl, status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Update payment details if provided
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }
    if (paymentSlipUrl) {
      booking.paymentSlipUrl = paymentSlipUrl;
    }
    if (status) {
      booking.status = status;
    }

    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating booking'
    });
  }
});

// Update customer info
router.patch('/:id/customer-info', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerInfo } = req.body;

    // Validate required fields
    if (!customerInfo || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({
        status: 'error',
        message: 'All customer information fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Validate phone format
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone format'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Update customer info
    booking.customerInfo = {
      firstName: customerInfo.firstName.trim(),
      lastName: customerInfo.lastName.trim(),
      email: customerInfo.email.trim().toLowerCase(),
      phone: customerInfo.phone.trim()
    };

    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating customer info:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating customer information'
    });
  }
});

export default router;
