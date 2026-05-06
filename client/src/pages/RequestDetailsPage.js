import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRequestDetails } from '../hooks/useRequestDetails';
import { acceptRequest, completeRequest } from '../services/requestService';
import Sidebar from '../components/Sidebar';
import BackButton from '../components/BackButton';
import RatingForm from '../components/RatingForm';
import RequestChat from '../components/RequestChat';

const RequestDetailsPage = () => {
  const { id } = useParams();

  // ✅ Pull user and loading state
  const { user, loading: authLoading } = useAuth();

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
    if (!request || !user) return;
    try {
      await acceptRequest(id, user.uid, request.requesterId);
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleComplete = async () => {
    if (!request) return;
    try {
      await completeRequest(
        id,
        request.shopperId,
        request.requesterId
      );
    } catch (err) {
      console.error('Failed to complete request:', err);
    }
  };

  // ── LOADING & ERROR STATES ──────────────────────────────────────────────────
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block border border-red-200 shadow-sm">
          <p className="font-bold">Access Blocked</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-400">Fetching Request Details...</p>
        </div>
      </div>
    );
  }

  // ── DATA LOGIC ─────────────────────────────────────────────────────────────

  const isRequester = user?.uid === request.requesterId;
  const isShopper   = user?.uid === request.shopperId;
  const isPosted    = request.status === 'Posted';
  const isAccepted  = request.status === 'Accepted';
  const isCompleted = request.status === 'Completed';

  const chatReceiverId = isRequester ? request.shopperId : request.requesterId;
  
  // Ensure we have the target ID before rendering the form
  const revieweeId = isRequester ? request.shopperId : request.requesterId;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <main className="flex-1 p-10 flex flex-col lg:flex-row gap-8">

        {/* ── Left: Request Details ─────────────────────────────────────── */}
        <div className="flex-1 max-w-2xl">
          <BackButton />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center mb-6">
              <span className="inline-block bg-blue-100 rounded-lg p-3 mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </span>
              <h2 className="text-2xl font-bold text-gray-800">{request.itemName}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-8 border-b border-gray-50 pb-6">
              <p><span className="font-semibold">Description:</span> {request.description || 'N/A'}</p>
              <p><span className="font-semibold">Store:</span> {request.storeName || 'N/A'}</p>
              <p><span className="font-semibold">Budget:</span> ₱{request.budget}</p>
              <p><span className="font-semibold">Fee:</span> ₱{request.convenienceFee}</p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {request.status}
                </span>
              </p>
            </div>

            <div className="flex gap-8 mb-8 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              {request.shopperId && (
                <span>
                  Shopper: <strong>{shopperRating !== null ? `★ ${shopperRating.toFixed(2)}` : 'N/A'}</strong>
                </span>
              )}
              {request.requesterId && (
                <span>
                  Requester: <strong>{requesterRating !== null ? `★ ${requesterRating.toFixed(2)}` : 'N/A'}</strong>
                </span>
              )}
            </div>

            {/* Role Specific Actions */}
            <div className="mt-4">
              {isRequester ? (
                <>
                  {isPosted && <p className="text-sm text-gray-400 italic">⏳ Waiting for a shopper...</p>}
                  {isAccepted && <p className="text-sm text-blue-600 font-medium">✓ Shopper found! Coordinate in chat →</p>}
                </>
              ) : (
                <>
                  {isPosted && (
                    <button onClick={handleAccept} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-sm">
                      Accept Request
                    </button>
                  )}
                  {isAccepted && isShopper && (
                    <button onClick={handleComplete} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">
                      Mark as Done
                    </button>
                  )}
                </>
              )}
            </div>

            {/* RATING SECTION */}
            {isCompleted && showRating && (
              <div className="mt-10 pt-8 border-t border-gray-100" id="rate">
                {hasRated ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium">
                    ✓ You have already rated this transaction.
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Rate the {isRequester ? 'Shopper' : 'Requester'}
                    </h3>
                    {user && revieweeId && (
                      <RatingForm
                        requestId={request.id}
                        reviewerId={user.uid}
                        revieweeId={revieweeId}
                        onRated={() => setHasRated(true)}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Chat ──────────────────────────────────────────────────── */}
        <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px] lg:h-[600px]">
          <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
            <span>💬</span> Messages
          </h3>

          {(isAccepted || isCompleted) && chatReceiverId ? (
            <RequestChat
              requestId={id}
              user={user}
              receiverId={chatReceiverId}
              disabled={isCompleted}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 text-sm italic">
              <span className="text-4xl mb-4 opacity-20">💬</span>
              {isRequester
                ? 'Chat opens once a shopper accepts.'
                : 'Chat opens once you accept.'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestDetailsPage;