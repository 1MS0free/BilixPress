import React from 'react';
import StatusBadge from './StatusBadge';

const RequestsTable = ({ requests }) => (
  <table className="w-full border mb-4">
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
          <td className="p-2 border"><StatusBadge status={r.status} /></td>
          <td className="p-2 border">{r.createdAt?.toDate().toLocaleDateString() || ''}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default RequestsTable;
