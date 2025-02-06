import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerInfo: {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
    }
  },
  bookingDetails: {
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required']
    },
    rooms: {
      type: Number,
      required: [true, 'Number of rooms is required'],
      min: [1, 'Number of rooms must be at least 1'],
      validate: {
        validator: async function(value) {
          try {
            if (value < 1) return false;
            
            const Villa = mongoose.model('Villa');
            const villa = await Villa.findOne({ isActive: true });
            if (!villa) {
              // If no villa exists, allow booking if rooms is 1
              return value === 1;
            }
            return value <= villa.bedrooms;
          } catch (error) {
            console.error('Error validating rooms:', error);
            return false;
          }
        },
        message: props => {
          if (props.value < 1) {
            return 'Number of rooms must be at least 1';
          }
          return 'Number of rooms cannot exceed villa capacity';
        }
      }
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    }
  },
  status: {
    type: String,
    enum: [
      'pending',
      'pending_payment',
      'in_review',
      'confirmed',
      'cancelled',
      'expired',
      'checked_in',
      'checked_out'
    ],
    default: 'pending',
    index: true
  },
  paymentSlipUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  canExpire: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 60 * 60 * 1000);
    },
    index: true
  }
}, {
  timestamps: true
});

// Create compound TTL index
bookingSchema.index(
  { expiresAt: 1 },
  { 
    expireAfterSeconds: 0,
    partialFilterExpression: {
      canExpire: true,
      expiresAt: { $exists: true, $ne: null }
    }
  }
);

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  try {
    // If payment slip is uploaded, prevent expiration and change status
    if (this.isModified('paymentSlipUrl') && this.paymentSlipUrl) {
      this.status = 'in_review';
      this.canExpire = false;
      this.expiresAt = null;
    }

    // If status changes to anything other than pending, prevent expiration
    if (this.isModified('status') && this.status !== 'pending') {
      this.canExpire = false;
      this.expiresAt = null;
    }

    // If status is changing to pending_payment, set expiration
    if (this.isModified('status') && this.status === 'pending_payment' && !this.paymentSlipUrl) {
      this.expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute deadline
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-find middleware
bookingSchema.pre(/^find/, function(next) {
  const now = new Date();
  
  this.where({
    $or: [
      // Keep documents that can't expire
      { canExpire: false },
      // Keep documents that haven't expired yet
      { expiresAt: { $gt: now } },
      // Keep documents with payment slip
      { paymentSlipUrl: { $exists: true } }
    ]
  });
  
  next();
});

// Instance method to check if booking is expired
bookingSchema.methods.isExpired = function() {
  if (!this.canExpire || this.paymentSlipUrl) {
    return false;
  }
  
  return this.expiresAt && this.expiresAt < new Date();
};

// Static method to manually clean up expired bookings if needed
bookingSchema.statics.cleanupExpired = async function() {
  const now = new Date();
  return this.deleteMany({
    canExpire: true,
    expiresAt: { $lt: now },
    paymentSlipUrl: { $exists: false }
  });
};

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(checkIn, checkOut) {
  try {
    console.log('Checking availability for:', { checkIn, checkOut });
    
    // Find any overlapping bookings
    const overlappingBookings = await this.find({
      'bookingDetails.checkIn': { $lt: checkOut },
      'bookingDetails.checkOut': { $gt: checkIn },
      status: { $nin: ['cancelled', 'rejected'] }
    });

    // Get villa capacity
    const Villa = mongoose.model('Villa');
    const villa = await Villa.findOne({ isActive: true });
    const maxRooms = villa ? villa.bedrooms : 1;

    // Calculate total booked rooms for each day
    const bookedRoomsByDay = new Map();
    for (const booking of overlappingBookings) {
      const start = new Date(Math.max(booking.bookingDetails.checkIn, checkIn));
      const end = new Date(Math.min(booking.bookingDetails.checkOut, checkOut));
      
      for (let day = start; day < end; day.setDate(day.getDate() + 1)) {
        const key = day.toISOString().split('T')[0];
        const currentRooms = bookedRoomsByDay.get(key) || 0;
        bookedRoomsByDay.set(key, currentRooms + booking.bookingDetails.rooms);
      }
    }

    // Check if any day exceeds capacity
    for (const [day, rooms] of bookedRoomsByDay) {
      if (rooms >= maxRooms) {
        console.log('No availability for day:', day, 'rooms:', rooms, 'maxRooms:', maxRooms);
        return false;
      }
    }

    console.log('Dates are available');
    return true;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
};

const Booking = mongoose.model('Booking', bookingSchema);

// Ensure indexes are created
Promise.all([
  // Create TTL index
  Booking.collection.createIndex(
    { expiresAt: 1 },
    { 
      expireAfterSeconds: 0,
      partialFilterExpression: {
        canExpire: true,
        expiresAt: { $exists: true, $ne: null }
      }
    }
  ),
  // Create compound index for queries
  Booking.collection.createIndex(
    { canExpire: 1, expiresAt: 1, paymentSlipUrl: 1, status: 1 },
    { background: true }
  )
]).then(() => {
  console.log('All booking indexes created successfully');
}).catch(err => {
  console.error('Error creating booking indexes:', err);
});

// Set up periodic cleanup
setInterval(async () => {
  try {
    await Booking.cleanupExpired();
  } catch (error) {
    console.error('Error cleaning up expired bookings:', error);
  }
}, 30 * 1000); // Run every 30 seconds

export default Booking;
