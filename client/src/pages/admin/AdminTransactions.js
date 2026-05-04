import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminLayout from '../../components/AdminLayout';
import TransactionsTable from '../../components/TransactionsTable';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setTransactions(snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(r => r.status === 'Completed')
      );
    });
    return () => unsub();
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Completed Transactions</h2>
      <TransactionsTable transactions={transactions} />
    </AdminLayout>
  );
};

export default AdminTransactions;
