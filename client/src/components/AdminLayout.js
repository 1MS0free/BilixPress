import React from 'react';
import Sidebar from './AdminSidebar';

const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 p-10">{children}</main>
  </div>
);

export default AdminLayout;
