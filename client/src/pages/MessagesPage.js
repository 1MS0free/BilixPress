import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Get all requests where user is requester or shopper
    const asRequester = query(collection(db, 'requests'), where('requesterId', '==', user.uid));
    const asShopper = query(collection(db, 'requests'), where('shopperId', '==', user.uid));

    const seen = new Set();
    const merge = (reqs) => {
      setConversations(prev => {
        const combined = [...prev, ...reqs].filter(r => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return (r.status === 'Accepted' || r.status === 'Completed') && r.shopperId;
        });
        return combined;
      });
      setLoading(false);
    };

    const unsub1 = onSnapshot(asRequester, (snap) => {
      merge(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(asShopper, (snap) => {
      merge(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-6">Messages</h2>
        {loading ? (
          <div className="text-gray-400">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center text-gray-500">
            No conversations yet.<br />Messages will appear here when a request is accepted.
          </div>
        ) : (
          <ul className="space-y-3">
            {conversations.map(req => {
              const otherName = user.uid === req.requesterId
                ? (req.shopperName || 'Shopper')
                : (req.requesterName || 'Requester');
              return (
                <li key={req.id}>
                  <Link
                    to={`/chat/${req.id}`}
                    className="flex items-center gap-4 bg-white rounded shadow px-5 py-4 hover:bg-blue-50 transition"
                  >
                    <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {otherName[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{otherName}</div>
                      <div className="text-sm text-gray-500">{req.itemName}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${req.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {req.status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;