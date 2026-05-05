import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminLayout from '../../components/AdminLayout';
import logo from '../../assets/logo_webapp.png'; // adjust path as needed

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

      {/* Logo Header */}
      <div className="flex items-center gap-3 mb-6">
        <img src={logo} alt="App Logo" className="h-14 w-14 rounded-2xl shadow" />
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">Manage users, requests, and transactions.</p>
        </div>
      </div>

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