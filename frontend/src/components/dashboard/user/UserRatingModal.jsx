// UserRatingModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// User Dashboard Component — Lets the logged-in user rate a completed booking.
// Connected directly to backend POST /api/vendor-reviews
// Used exclusively in: pages/dashboard/UserDashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsUp } from 'lucide-react';

export default function UserRatingModal({ isOpen, onClose, booking, onSubmitRating }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setRating(booking.ratingSubmitted || 5);
      setReview(booking.review || '');
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitRating({
        bookingId: booking.rawBooking?._id || booking._id || booking.id,
        rating,
        review,
      });
      onClose();
    } catch (err) {
      console.error('Error in review submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto overscroll-contain"
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] my-auto"
        >
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rate Technician &amp; Service
            </h3>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            data-lenis-prevent
            onSubmit={handleSubmit}
            className="p-6 space-y-5 text-center overflow-y-auto overscroll-contain custom-scrollbar flex-1"
          >
            <div>
              <p className="text-sm font-bold text-gray-800">{booking.service}</p>
              <p className="text-xs text-gray-400 mt-0.5">Technician: {booking.technician || 'Assigned Technician'}</p>
            </div>

            {/* Star Rating Input */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience (e.g. punctual, expert repair, clean work)..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-50"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4" />
                    <span>{booking?.ratingSubmitted ? 'Update Review' : 'Submit Review'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
