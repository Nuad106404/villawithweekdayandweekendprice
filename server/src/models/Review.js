const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: String,
  comment: {
    type: String,
    required: true,
  },
  response: {
    comment: String,
    date: Date,
    author: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isVerifiedStay: {
    type: Boolean,
    default: false,
  },
  isStatic: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  helpfulVotes: {
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
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for common queries
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerifiedStay: 1 });
reviewSchema.index({ 'author.email': 1 });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function() {
  const result = await this.aggregate([
    {
      $match: { status: 'approved' }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length > 0) {
    const { averageRating, totalReviews, ratingDistribution } = result[0];
    const distribution = {
      5: ratingDistribution.filter(r => r === 5).length,
      4: ratingDistribution.filter(r => r === 4).length,
      3: ratingDistribution.filter(r => r === 3).length,
      2: ratingDistribution.filter(r => r === 2).length,
      1: ratingDistribution.filter(r => r === 1).length,
    };

    return {
      average: averageRating,
      total: totalReviews,
      distribution
    };
  }

  return {
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };
};

module.exports = mongoose.model('Review', reviewSchema);
