import React from 'react';

const UsersTable = ({ users }) => (
  <table className="w-full border mb-4">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 border">Name</th>
        <th className="p-2 border">Email</th>
        <th className="p-2 border">Role</th>
        <th className="p-2 border">Rating</th>
        <th className="p-2 border">Joined</th>
      </tr>
    </thead>
    <tbody>
      {users.map(u => (
        <tr key={u.id}>
          <td className="p-2 border">{u.name}</td>
          <td className="p-2 border">{u.email}</td>
          <td className="p-2 border">{u.role}</td>
          <td className="p-2 border">{u.ratingAverage?.toFixed(2) || 0} ({u.ratingCount})</td>
          <td className="p-2 border">{u.createdAt?.toDate().toLocaleDateString() || ''}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default UsersTable;
