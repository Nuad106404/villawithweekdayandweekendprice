import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const reviews = [
  {
    id: 1,
    author: 'Sarah Johnson',
    rating: 5,
    date: '2024-02-15',
    comment: 'Absolutely stunning villa with amazing views. The staff was incredibly helpful and attentive.',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    author: 'Michael Chen',
    rating: 4,
    date: '2024-02-10',
    comment: 'Great location and beautiful property. The pool was perfect for our family.',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 3,
    author: 'Emma Wilson',
    rating: 5,
    date: '2024-02-05',
    comment: 'Exceeded our expectations in every way. Will definitely return!',
    avatar: 'https://i.pravatar.cc/150?img=3'
  }
];

export function VillaReviews() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Guest Reviews</h2>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-amber-400 fill-current" />
          <span className="font-medium">4.9</span>
          <span className="text-gray-500 dark:text-gray-400">(128 reviews)</span>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-start space-x-4">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {review.author}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}