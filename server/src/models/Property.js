const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  alt: String,
  title: String,
  order: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  capacity: {
    minGuests: {
      type: Number,
      required: true,
      default: 1,
    },
    maxGuests: {
      type: Number,
      required: true,
    },
    maxChildren: {
      type: Number,
      required: true,
    },
  },
  size: {
    squareFeet: {
      type: Number,
      required: true,
    },
    rooms: {
      bedrooms: { type: Number, required: true },
      bathrooms: { type: Number, required: true },
    },
  },
  images: [imageSchema],
  amenities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Amenity',
  }],
  pricing: {
    baseRate: {
      type: Number,
      required: true,
    },
    cleaningFee: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active',
  },
  blackoutDates: [{
    startDate: Date,
    endDate: Date,
    reason: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
propertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure at least one featured image
propertySchema.pre('save', function(next) {
  if (this.images && this.images.length > 0 && !this.images.some(img => img.isFeatured)) {
    this.images[0].isFeatured = true;
  }
  next();
});

// Add indexes for common queries
propertySchema.index({ status: 1 });
propertySchema.index({ 'location.city': 1, 'location.country': 1 });

module.exports = mongoose.model('Property', propertySchema);
