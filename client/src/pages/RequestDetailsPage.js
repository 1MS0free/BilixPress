import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRequestDetails } from '../hooks/useRequestDetails';
import { acceptRequest, completeRequest } from '../services/requestService';
import Sidebar from '../components/Sidebar';
import BackButton from '../components/BackButton';
import RatingForm from '../components/RatingForm';
import RequestChat from '../components/RequestChat';

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    request,
    shopperRating,
    requesterRating,
    showRating,
    hasRated,
    setHasRated,
    error,
  } = useRequestDetails(id, user?.uid);

  const handleAccept = async () => {
    try {
      await acceptRequest(id, user.uid);
      navigate(`/chat/${id}`);
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleComplete = async () => {
    try {
      await completeRequest(id);
    } catch (err) {
      console.error('Failed to complete request:', err);
    }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (error)    return <div className="p-8 text-red-500">{error}</div>;
  if (!request) return <div className="p-8">Loading...</div>;

  const isRequester = user?.uid === request.requesterId;
  const isShopper   = user?.uid === request.shopperId;
  const isPosted    = request.status === 'Posted';
  const isAccepted  = request.status === 'Accepted';
  const isCompleted = request.status === 'Completed';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <main className="flex-1 p-10 flex gap-8">

        {/* ── Left: Request Details ─────────────────────────────────────── */}
        <div className="flex-1 max-w-2xl">
          <BackButton />

          <div className="bg-white rounded shadow p-6 mb-6">

            {/* Header */}
            <div className="flex items-center mb-4">
              <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2 mr-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="6" fill="#2563eb" />
                </svg>
              </span>
              <h2 className="text-2xl font-bold">{request.itemName}</h2>
            </div>

            {/* Info fields */}
            <div className="space-y-1 text-sm text-gray-700 mb-4">
              <p>Description: {request.description || 'N/A'}</p>
              <p>Store: {request.storeName || 'N/A'}</p>
              <p>Budget: ₱{request.budget}</p>
              <p>Convenience Fee: ₱{request.convenienceFee}</p>
              <p>
                Status:{' '}
                <span className="font-semibold">{request.status}</span>
              </p>
            </div>

            {/* Ratings row */}
            <div className="flex gap-6 mb-4 text-sm text-yellow-600">
              {request.shopperId && (
                <span>
                  Shopper Rating:{' '}
                  <strong>
                    {shopperRating !== null ? `★ ${shopperRating.toFixed(2)}` : 'N/A'}
                  </strong>
                </span>
              )}
              {request.requesterId && (
                <span>
                  Requester Rating:{' '}
                  <strong>
                    {requesterRating !== null ? `★ ${requesterRating.toFixed(2)}` : 'N/A'}
                  </strong>
                </span>
              )}
            </div>

            {/* ── Requester POV ───────────────────────────────────────────── */}
            {isRequester && (
              <>
                {isPosted && (
                  <p className="mt-4 text-sm text-gray-400 italic">
                    ⏳ Waiting for a shopper to accept your request...
                  </p>
                )}
                {isAccepted && (
                  <p className="mt-4 text-sm text-blue-600 font-medium">
                    ✓ A shopper has accepted your request. Chat is now open.
                  </p>
                )}
                {isCompleted && (
                  <p className="mt-4 text-sm text-green-600 font-medium">
                    ✓ This request has been completed.
                  </p>
                )}
              </>
            )}

            {/* ── Shopper POV ─────────────────────────────────────────────── */}
            {!isRequester && (
              <>
                {isPosted && (
                  <button
                    onClick={handleAccept}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Accept Request
                  </button>
                )}
                {isAccepted && isShopper && (
                  <button
                    onClick={handleComplete}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Mark as Done
                  </button>
                )}
              </>
            )}

            {/* ── Rating Section (both sides, Completed only) ──────────────── */}
            {isCompleted && showRating && (
              <div className="mt-8" id="rate">
                {hasRated ? (
                  <p className="text-green-600 font-semibold">
                    ✓ You have already rated this transaction.
                  </p>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span className="bg-yellow-100 text-yellow-600 rounded-full p-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2
                               9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            fill="#facc15"
                          />
                        </svg>
                      </span>
                      {isRequester ? 'Rate the Shopper' : 'Rate the Requester'}
                    </h3>
                    <RatingForm
                      requestId={request.id}
                      reviewerId={user.uid}
                      revieweeId={isRequester ? request.shopperId : request.requesterId}
                      onRated={() => setHasRated(true)}
                    />
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Right: Chat Sidebar ──────────────────────────────────────────── */}
        <div className="w-full max-w-sm bg-white rounded shadow p-6 flex flex-col h-fit self-start">
          <h3 className="text-lg font-bold mb-4">Messages</h3>

          {isAccepted || isCompleted ? (
            <RequestChat requestId={id} user={user} disabled={isCompleted} />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 text-sm italic">
              <span className="text-3xl mb-2">💬</span>
              Chat will be available once a shopper accepts your request.
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default RequestDetailsPage;
