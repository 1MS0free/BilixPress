import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [lastMsgMap, setLastMsgMap]       = useState({}); // requestId → last message
  const [loading, setLoading]             = useState(true);

  // ── Load conversations (requests) ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const handleSnapshot = (snap) => {
      const reqs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r =>
          (r.status === 'Accepted' || r.status === 'Completed') && r.shopperId
        );

      setConversations(prev => {
        const existingMap = Object.fromEntries(prev.map(r => [r.id, r]));
        reqs.forEach(r => { existingMap[r.id] = r; });
        return Object.values(existingMap);
      });

      setLoading(false);
    };

    const unsub1 = onSnapshot(
      query(collection(db, 'requests'), where('requesterId', '==', user.uid)),
      handleSnapshot
    );
    const unsub2 = onSnapshot(
      query(collection(db, 'requests'), where('shopperId', '==', user.uid)),
      handleSnapshot
    );

    return () => { unsub1(); unsub2(); };
  }, [user]);

  // ── For each conversation, listen to its latest message ───────────────────
  useEffect(() => {
    if (conversations.length === 0) return;

    const unsubs = conversations.map(req => {
      const q = query(
        collection(db, 'messages'),
        where('requestId', '==', req.id),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const msg = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setLastMsgMap(prev => ({ ...prev, [req.id]: msg }));
        }
      });
    });

    return () => unsubs.forEach(u => u());
  }, [conversations]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-10">
        <h2 className="text-2xl font-bold mb-6">Messages</h2>

        {loading ? (
          <div className="text-gray-400">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center text-gray-500">
            No conversations yet.<br />
            Messages will appear here when a request is accepted.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-y-auto max-h-[70vh]">
            <ul className="divide-y divide-gray-100">
              {conversations.map(req => {
                const otherName = user.uid === req.requesterId
                  ? (req.shopperName  || 'Shopper')
                  : (req.requesterName || 'Requester');

                const lastMsg = lastMsgMap[req.id];
                const isSystemEdit = lastMsg?.system === true &&
                  lastMsg?.text?.startsWith('📝');

                // Preview text shown under the name
                const preview = lastMsg
                  ? isSystemEdit
                    ? '✏️ Request was updated'
                    : lastMsg.text?.length > 50
                      ? lastMsg.text.slice(0, 50) + '…'
                      : lastMsg.text
                  : req.itemName;

                return (
                  <li key={req.id}>
                    <Link
                      to={`/request/${req.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50 transition"
                    >
                      {/* Avatar */}
                      <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {otherName[0]?.toUpperCase() || '?'}
                      </div>

                      {/* Name + preview */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{otherName}</div>
                        <div className={`text-sm truncate ${
                          isSystemEdit ? 'text-amber-600 font-medium' : 'text-gray-500'
                        }`}>
                          {preview}
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                        req.status === 'Completed'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {req.status}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
