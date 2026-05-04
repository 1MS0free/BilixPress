import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(all);
      setTransactions(all.filter(r => r.status === 'Completed'));
    });
    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-2xl font-bold mb-1">{users.length}</div>
          <div className="text-gray-500">Total Users</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-2xl font-bold mb-1">{requests.length}</div>
          <div className="text-gray-500">Total Requests</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-2xl font-bold mb-1">{transactions.length}</div>
          <div className="text-gray-500">Completed Transactions</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
