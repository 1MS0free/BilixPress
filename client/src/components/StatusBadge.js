import React from 'react';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-300 text-gray-800';
  if (status === 'Accepted') color = 'bg-blue-200 text-blue-800';
  if (status === 'Delivered') color = 'bg-orange-200 text-orange-800';
  if (status === 'Completed') color = 'bg-green-200 text-green-800';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
  );
};

export default StatusBadge;
