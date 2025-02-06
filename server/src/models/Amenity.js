const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'outdoor', 'indoor', 'kitchen', 'entertainment', 'safety'],
  },
  description: String,
  icon: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    alt: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
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
amenitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for common queries
amenitySchema.index({ category: 1, isActive: 1 });
amenitySchema.index({ order: 1 });

module.exports = mongoose.model('Amenity', amenitySchema);
