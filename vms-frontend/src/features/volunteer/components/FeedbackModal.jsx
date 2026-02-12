import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { useApi } from '../../../useApi';

export default function FeedbackModal({ isOpen, onClose, event, onSuccess, initialData = null }) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState(initialData?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const { apiCall } = useApi();

  // Reset state when modal opens with new data
  React.useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating || 0);
      setFeedback(initialData?.comment || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    try {
      setSubmitting(true);
      const isUpdate = !!initialData?.id;
      const url = isUpdate 
        ? `/volunteers/feedback/${initialData.id}?volunteerId=${event.volunteerId}`
        : `/volunteers/${event.registrationId}/feedback?volunteerId=${event.volunteerId}`;
      
      await apiCall(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        body: JSON.stringify({ rating, feedback })
      });

      alert(isUpdate ? 'Feedback updated successfully!' : 'Feedback submitted successfully! Thank you.');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save feedback:', err);
      alert('Failed to save feedback: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold">Event Feedback</h2>
          <p className="text-blue-50 mt-1 opacity-90">How was your experience with {event.title}?</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Rating */}
            <div className="text-center">
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Overall Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-all duration-200 hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={40}
                      className={`${
                        star <= (hover || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-4 text-gray-600 font-medium h-6">
                {rating === 1 && 'Poor 😞'}
                {rating === 2 && 'Fair 😐'}
                {rating === 3 && 'Good 🙂'}
                {rating === 4 && 'Very Good 😊'}
                {rating === 5 && 'Excellent! 😍'}
              </p>
            </div>

            {/* Feedback Text */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest">
                Share your thoughts
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you like? What could be improved?"
                className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-gray-700 font-medium"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {submitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
