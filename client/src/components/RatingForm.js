import React, { useState } from 'react';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const Star = ({ filled, onClick }) => (
  <span
    onClick={onClick}
    className={`cursor-pointer text-2xl transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
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
    if (rating < 1) return;
    
    setError('');
    setLoading(true);

    try {
      // 1. Add the new review to the 'reviews' collection
      await addDoc(collection(db, 'reviews'), {
        requestId,
        reviewerId,
        revieweeId,
        rating: Number(rating),
        comment,
        createdAt: serverTimestamp(),
      });

      // 2. Fetch all reviews for this specific user (revieweeId)
      const q = query(
        collection(db, 'reviews'), 
        where('revieweeId', '==', revieweeId)
      );
      const snapshot = await getDocs(q);
      
      // 3. Calculate the new average
      const ratings = snapshot.docs.map(d => d.data().rating);
      const totalCount = ratings.length;
      const sum = ratings.reduce((acc, curr) => acc + curr, 0);
      const newAverage = sum / totalCount;

      // 4. Update the reviewee's document in the 'users' collection
      // This is what makes the Dashboard/Sidebar update!
      const userRef = doc(db, 'users', revieweeId);
      await updateDoc(userRef, {
        rating: newAverage,
        reviewCount: totalCount
      });

      setSuccess(true);
      if (onRated) onRated();
    } catch (err) {
      console.error("Rating Error:", err);
      setError("Failed to save rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="bg-green-50 text-green-600 p-4 rounded-lg font-semibold text-center border border-green-100">
      ✓ Thank you for your rating!
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
      <p className="text-sm text-gray-500 mb-2 font-medium">How was your experience?</p>
      
      <div className="mb-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            filled={star <= rating} 
            onClick={() => setRating(star)} 
          />
        ))}
      </div>

      <textarea
        className="w-full border border-gray-200 rounded-lg p-3 mb-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
        placeholder="Leave a comment (optional)..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
      />

      {error && <div className="text-red-500 text-xs mb-3">{error}</div>}

      <button
        type="submit"
        className="w-full bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        disabled={loading || rating < 1}
      >
        {loading ? 'Processing...' : 'Submit Rating'}
      </button>
    </form>
  );
};

export default RatingForm;