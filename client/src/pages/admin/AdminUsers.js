import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminLayout from '../../components/AdminLayout';
import UsersTable from '../../components/UsersTable';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
      <input
        className="mb-4 p-2 border rounded w-full max-w-xs"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <UsersTable users={filtered} />
    </AdminLayout>
  );
};

export default AdminUsers;
