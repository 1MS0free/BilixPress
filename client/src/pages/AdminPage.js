import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import Sidebar from '../components/Sidebar';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">All Users</h3>
            <table className="w-full border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Rating</th>
                  <th className="p-2 border">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="p-2 border">{u.name}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.ratingAverage?.toFixed(2) || 0} ({u.ratingCount})</td>
                    <td className="p-2 border">{u.createdAt?.toDate().toLocaleDateString() || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">All Requests</h3>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Requester</th>
                  <th className="p-2 border">Shopper</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td className="p-2 border">{r.itemName}</td>
                    <td className="p-2 border">{r.requesterId}</td>
                    <td className="p-2 border">{r.shopperId || '-'}</td>
                    <td className="p-2 border">{r.status}</td>
                    <td className="p-2 border">{r.createdAt?.toDate().toLocaleDateString() || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
