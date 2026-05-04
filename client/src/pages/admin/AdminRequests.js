import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminLayout from '../../components/AdminLayout';
import RequestsTable from '../../components/RequestsTable';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const filtered = status ? requests.filter(r => r.status === status) : requests;

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Manage Requests</h2>
      <select
        className="mb-4 p-2 border rounded"
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="Posted">Posted</option>
        <option value="Accepted">Accepted</option>
        <option value="Delivered">Delivered</option>
        <option value="Completed">Completed</option>
      </select>
      <RequestsTable requests={filtered} />
    </AdminLayout>
  );
};

export default AdminRequests;
