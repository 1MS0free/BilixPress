import React, { useEffect, useState } from 'react';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { checkDuplicateRating } from '../services/ratingService';

const statusColor = (status) => {
  if (status === 'Accepted')  return 'text-green-600 bg-green-50 border border-green-200';
  if (status === 'Completed') return 'text-blue-600 bg-blue-50 border border-blue-200';
  return 'text-gray-600 bg-gray-100 border border-gray-200';
};

// ── Builds a human-readable change summary ──────────────────────────────────
const buildChangeLog = (original, updated) => {
  const lines = [];

  const fields = [
    { key: 'itemName',       label: 'Item',     prefix: '',  suffix: '' },
    { key: 'storeName',      label: 'Store',    prefix: '',  suffix: '' },
    { key: 'budget',         label: 'Budget',   prefix: '₱', suffix: '' },
    { key: 'convenienceFee', label: 'Conv. Fee',prefix: '₱', suffix: '' },
  ];

  fields.forEach(({ key, label, prefix, suffix }) => {
    const oldVal = original[key];
    const newVal = updated[key];
    // loose equality covers number vs string edge cases
    // eslint-disable-next-line eqeqeq
    if (oldVal != newVal) {
      lines.push(`• ${label}: ${prefix}${oldVal}${suffix} → ${prefix}${newVal}${suffix}`);
    }
  });

  return lines;
};

// ── Edit Modal ───────────────────────────────────────────────────────────────
const EditRequestModal = ({ request, onClose, onSave }) => {
  const [itemName,       setItemName]       = useState(request.itemName       || '');
  const [storeName,      setStoreName]      = useState(request.storeName      || '');
  const [budget,         setBudget]         = useState(request.budget         ?? '');
  const [convenienceFee, setConvenienceFee] = useState(request.convenienceFee ?? '');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!itemName.trim())
      return setError('Item name is required.');
    if (isNaN(budget) || Number(budget) < 0)
      return setError('Budget must be a valid number.');
    if (isNaN(convenienceFee) || Number(convenienceFee) < 0)
      return setError('Convenience fee must be a valid number.');

    setSaving(true);
    try {
      await onSave(request, {
        itemName:       itemName.trim(),
        storeName:      storeName.trim(),
        budget:         Number(budget),
        convenienceFee: Number(convenienceFee),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Only allow editing if NOT Completed
  const isEditable = request.status !== 'Completed';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">✏️ Edit Request</h3>
            {request.status === 'Accepted' && (
              <p className="text-indigo-200 text-xs mt-0.5">
                ⚠️ A shopper has already accepted — they'll be notified of your changes.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none transition"
            aria-label="Close"
          >×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. 1kg White Rice"
              disabled={!isEditable}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. SM Supermarket"
              disabled={!isEditable}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {/* Budget + Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Budget (₱)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Conv. Fee (₱)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={convenienceFee}
                onChange={(e) => setConvenienceFee(e.target.value)}
                placeholder="0.00"
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          {/* Note about auto-message */}
          {request.status === 'Accepted' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              💬 An automated message will be sent to the shopper listing exactly what changed.
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium transition"
            >
              Cancel
            </button>
            {isEditable && (
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-semibold transition disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const MyRequestsPage = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [requests,   setRequests]   = useState([]);
  const [ratedMap,   setRatedMap]   = useState({});
  const [editingReq, setEditingReq] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'requests'), where('requesterId', '==', user.uid));
    const unsub = onSnapshot(q, async (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      reqs.sort((a, b) => {
        const order = { Accepted: 0, Posted: 1, Completed: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });
      setRequests(reqs);

      const rated = {};
      await Promise.all(
        reqs.map(async (req) => {
          if (req.status === 'Completed') {
            rated[req.id] = await checkDuplicateRating(req.id, user.uid);
          }
        })
      );
      setRatedMap(rated);
    });
    return () => unsub();
  }, [user]);

  // ── Save handler: update doc + send auto-message if shopper exists ─────────
  const handleSaveEdit = async (originalRequest, updatedFields) => {
    const reqRef = doc(db, 'requests', originalRequest.id);

    // 1. Persist the updated fields
    await updateDoc(reqRef, updatedFields);

    // 2. If a shopper is on this request, send an automated chat message
    if (originalRequest.shopperId) {
      const changes = buildChangeLog(originalRequest, updatedFields);

      if (changes.length > 0) {
        const messageText =
          `📝 The requester has updated this request:\n\n${changes.join('\n')}\n\n` +
          `Please take note of these changes before purchasing.`;

        // Top-level 'messages' collection — matches your Firestore structure
        await addDoc(collection(db, 'messages'), {
          text:       messageText,
          senderId:   originalRequest.requesterId,
          receiverId: originalRequest.shopperId,
          requestId:  originalRequest.id,
          system:     true,             // flags it as an automated message
          createdAt:  serverTimestamp(),
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <main className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-6">My Requests</h2>

        {requests.length === 0 ? (
          <div className="text-gray-500">No requests yet.</div>
        ) : (
          <ul className="space-y-4">
            {requests.map(req => (
              <li
                key={req.id}
                className={`bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4
                  ${req.status === 'Accepted' ? 'ring-2 ring-green-400' : ''}`}
              >
                {/* ── Info ── */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-lg">{req.itemName}</div>
                    {req.status === 'Accepted' && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse font-semibold">
                        ACCEPTED
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">Store: {req.storeName || 'N/A'}</div>
                  <div className="text-gray-500 text-sm">
                    Budget: ₱{req.budget}&nbsp;|&nbsp;Fee: ₱{req.convenienceFee}
                  </div>
                  <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${statusColor(req.status)}`}>
                    {req.status}
                  </span>

                  {req.status === 'Posted' && (
                    <p className="text-xs text-gray-400 italic mt-1">
                      ⏳ Waiting for a shopper to accept...
                    </p>
                  )}
                  {req.status === 'Accepted' && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      🎉 A shopper accepted your request! You can now chat with them.
                    </p>
                  )}
                  {req.status === 'Completed' && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      ✓ Request completed.
                    </p>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-col gap-2 min-w-[170px]">

                  {/* View Details — always */}
                  <Link
                    to={`/request/${req.id}`}
                    className="text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    View Details
                  </Link>

                  {/* ── EDIT — Posted or Accepted (NOT Completed) ── */}
                  {req.status !== 'Completed' && (
                    <button
                      onClick={() => setEditingReq(req)}
                      className={`text-center px-4 py-2 rounded-lg text-sm font-medium transition border
                        ${req.status === 'Accepted'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
                    >
                      ✏️ Edit Request
                    </button>
                  )}

                  {/* ── CHAT — Accepted or Completed ── */}
                  {(req.status === 'Accepted' || req.status === 'Completed') && req.shopperId && (
                    <Link
                      to={`/request/${req.id}`}
                      className={`text-center text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                        ${req.status === 'Accepted'
                          ? 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-200'
                          : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      💬 Chat with Shopper
                    </Link>
                  )}

                  {/* ── RATE — Completed, not yet rated ── */}
                  {req.status === 'Completed' && req.shopperId && !ratedMap[req.id] && (
                    <Link
                      to={`/request/${req.id}#rate`}
                      className="text-center bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 text-sm font-medium"
                    >
                      ⭐ Rate Shopper
                    </Link>
                  )}

                  {/* Already rated */}
                  {req.status === 'Completed' && ratedMap[req.id] && (
                    <span className="text-center text-green-600 text-sm font-medium px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      ✓ Rated
                    </span>
                  )}

                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* ── Edit Modal ── */}
      {editingReq && (
        <EditRequestModal
          request={editingReq}
          onClose={() => setEditingReq(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default MyRequestsPage;
