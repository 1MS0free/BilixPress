import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import * as XLSX from 'xlsx';

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Use a map to avoid duplicates from both queries
    let merged = {};

    const merge = (docs) => {
      docs.forEach(doc => { merged[doc.id] = { id: doc.id, ...doc.data() }; });
      setTransactions(Object.values(merged));
    };

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

    const unsub1 = onSnapshot(q1, snap => merge(snap.docs));
    const unsub2 = onSnapshot(q2, snap => merge(snap.docs));

    return () => { unsub1(); unsub2(); };
  }, [user]);

  // FIXED: earnings = convenienceFee ONLY (budget is what the shopper spends to buy the item)
  const getEarnings = (tx) => Number(tx.convenienceFee) || 0;

  const shopperTxs = transactions.filter(tx => tx.shopperId === user?.uid);
  const totalEarnings = shopperTxs.reduce((sum, tx) => sum + getEarnings(tx), 0);
  const totalTransactions = shopperTxs.length;

  // Group by month for summary
  const groupByMonth = () => {
    const map = {};
    shopperTxs.forEach(tx => {
      const date = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
      const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!map[key]) map[key] = { label, total: 0, count: 0 };
      map[key].total += getEarnings(tx);
      map[key].count += 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1 — All Transactions
    const txRows = transactions.map(tx => {
      const date = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
      const role = tx.shopperId === user.uid ? 'Shopper' : 'Requester';
      return {
        'Date':                date.toLocaleDateString(),
        'Item':                tx.itemName || '',
        'Store':               tx.storeName || 'N/A',
        'Role':                role,
        'Budget (₱)':          Number(tx.budget) || 0,
        'Convenience Fee (₱)': Number(tx.convenienceFee) || 0,
        'Earnings (₱)':        role === 'Shopper' ? getEarnings(tx) : 0,
        'Status':              tx.status || 'Completed',
      };
    });
    const txSheet = XLSX.utils.json_to_sheet(txRows);
    txSheet['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, txSheet, 'All Transactions');

    // Sheet 2 — Monthly Summary
    const monthly = groupByMonth();
    const monthRows = monthly.map(m => ({ 'Month': m.label, 'Transactions': m.count, 'Total Earned (₱)': m.total }));
    monthRows.push({ 'Month': 'TOTAL', 'Transactions': totalTransactions, 'Total Earned (₱)': totalEarnings });
    const monthSheet = XLSX.utils.json_to_sheet(monthRows);
    monthSheet['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, monthSheet, 'Monthly Summary');

    // Sheet 3 — Running Total
    const sorted = [...shopperTxs]
      .map(tx => ({ ...tx, _date: tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt) }))
      .sort((a, b) => a._date - b._date);
    let cumulative = 0;
    const runningRows = sorted.map(tx => {
      cumulative += getEarnings(tx);
      return { 'Date': tx._date.toLocaleDateString(), 'Item': tx.itemName || '', 'Earned (₱)': getEarnings(tx), 'Cumulative Total (₱)': cumulative };
    });
    const runSheet = XLSX.utils.json_to_sheet(runningRows);
    runSheet['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 12 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, runSheet, 'Running Total');

    XLSX.writeFile(wb, `Bilixpress_Earnings_${user.name || 'Report'}.xlsx`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            <button
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
              Export Earnings Report
            </button>
          </div>

          {/* Total earnings summary card — visible at all times */}
          {shopperTxs.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Total Earnings</div>
                <div className="text-3xl font-bold text-green-600">₱{totalEarnings.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">from all completed tasks</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Completed Tasks</div>
                <div className="text-3xl font-bold text-blue-600">{totalTransactions}</div>
                <div className="text-xs text-gray-400 mt-1">as shopper</div>
              </div>
            </div>
          )}

          {/* Transaction list card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">All Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No completed transactions yet.</div>
            ) : (
              <div className="overflow-y-auto max-h-[55vh] pr-1">
                <ul className="space-y-3">
                  {transactions.map(tx => {
                    const isShopper = tx.shopperId === user.uid;
                    return (
                      <li key={tx.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                        <div className="font-semibold text-gray-900">{tx.itemName}</div>
                        <div className="text-gray-500 text-sm mt-0.5">Store: {tx.storeName || 'N/A'}</div>
                        <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-600">
                          <span>Budget: ₱{tx.budget}</span>
                          <span>Fee: ₱{tx.convenienceFee}</span>
                          <span className={`font-medium ${isShopper ? 'text-blue-600' : 'text-gray-500'}`}>
                            Role: {isShopper ? 'Shopper' : 'Requester'}
                          </span>
                        </div>
                        {/* FIXED: only convenienceFee is the shopper's earning */}
                        {isShopper && (
                          <div className="mt-1.5 text-green-700 font-semibold text-sm">
                            Earnings: ₱{getEarnings(tx)}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default TransactionHistoryPage;
