// UserRatingModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// User Dashboard Component — Lets the logged-in user rate a completed booking.
// Used exclusively in: pages/dashboard/UserDashboardPage.jsx
// Renamed from: RatingModal.jsx  →  UserRatingModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsUp } from 'lucide-react';

export default function UserRatingModal({ isOpen, onClose, booking, onSubmitRating }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRating({
      bookingId: booking.id,
      rating,
      review,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rate Technician &amp; Service
            </h3>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-center">
            <div>
              <p className="text-sm font-bold text-gray-800">{booking.service}</p>
              <p className="text-xs text-gray-400 mt-0.5">Technician: {booking.technician || 'Ramesh Kumar'}</p>
            </div>

            {/* Star Rating Input */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience (e.g. punctual, expert repair, clean work)..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" /> Submit Review
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
