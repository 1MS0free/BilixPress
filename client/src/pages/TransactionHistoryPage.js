import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q1 = query(
      collection(db, 'requests'),
      where('status', '==', 'Completed'),
      where('requesterId', '==', user.uid)
    );
    const q2 = query(
      collection(db, 'requests'),
      where('status', '==', 'Completed'),
      where('shopperId', '==', user.uid)
    );
    const unsub1 = onSnapshot(q1, (snapshot1) => {
      const reqs1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(prev => {
        const others = prev.filter(tx => tx.requesterId !== user.uid);
        return [...others, ...reqs1];
      });
    });
    const unsub2 = onSnapshot(q2, (snapshot2) => {
      const reqs2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(prev => {
        const others = prev.filter(tx => tx.shopperId !== user.uid);
        return [...others, ...reqs2];
      });
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  return (
    // Outer layout: fixed height, no page scroll
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Transaction History</h2>

          {transactions.length === 0 ? (
            <div>No completed transactions.</div>
          ) : (
            // Scrollable container — only this box scrolls
            <div className="overflow-y-auto max-h-[60vh] pr-1">
              <ul>
                {transactions.map(tx => (
                  <li key={tx.id} className="mb-4 p-4 border rounded">
                    <div className="font-semibold">{tx.itemName}</div>
                    <div className="text-gray-600">Store: {tx.storeName || 'N/A'}</div>
                    <div className="text-gray-600">Budget: ₱{tx.budget}</div>
                    <div className="text-gray-600">Fee: ₱{tx.convenienceFee}</div>
                    <div className="text-gray-600">Role: {tx.requesterId === user.uid ? 'Requester' : 'Shopper'}</div>
                    {tx.shopperId === user.uid && (
                      <div className="text-green-700 font-semibold">
                        Earnings: ₱{(Number(tx.convenienceFee) || 0) + (Number(tx.budget) || 0)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransactionHistoryPage;
