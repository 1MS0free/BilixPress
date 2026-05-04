import React, { useState } from 'react';
import { addRating } from '../services/ratingService';

const Star = ({ filled, onClick }) => (
  <span
    onClick={onClick}
    className={`cursor-pointer text-2xl ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    role="button"
    aria-label="star"
  >
    ★
  </span>
);

const RatingForm = ({ requestId, revieweeId, reviewerId, onRated }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await addRating({ requestId, reviewerId, revieweeId, rating, comment });
      setSuccess(true);
      if (onRated) onRated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return <div className="text-green-600 font-semibold">Thank you for your rating!</div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">
      <div className="mb-2 flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} filled={star <= rating} onClick={() => setRating(star)} />
        ))}
      </div>
      <textarea
        className="w-full border rounded p-2 mb-2"
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="bg-black text-white px-6 py-2 rounded font-semibold mt-2 hover:bg-gray-800 transition"
        disabled={loading || rating < 1}
      >
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  );
};

export default RatingForm;
