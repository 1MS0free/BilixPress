import React from 'react';

const TransactionsTable = ({ transactions }) => (
  <table className="w-full border mb-4">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 border">Item</th>
        <th className="p-2 border">Requester</th>
        <th className="p-2 border">Shopper</th>
        <th className="p-2 border">Convenience Fee</th>
        <th className="p-2 border">Date</th>
        <th className="p-2 border">Requester Rating</th>
        <th className="p-2 border">Shopper Rating</th>
      </tr>
    </thead>
    <tbody>
      {transactions.map(tx => (
        <tr key={tx.id}>
          <td className="p-2 border">{tx.itemName}</td>
          <td className="p-2 border">{tx.requesterId}</td>
          <td className="p-2 border">{tx.shopperId}</td>
          <td className="p-2 border">₱{tx.convenienceFee}</td>
          <td className="p-2 border">{tx.createdAt?.toDate().toLocaleDateString() || ''}</td>
          <td className="p-2 border">{tx.requesterRating || '-'}</td>
          <td className="p-2 border">{tx.shopperRating || '-'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TransactionsTable;
