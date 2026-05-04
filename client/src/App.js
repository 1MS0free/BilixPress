import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PostRequestPage from './pages/PostRequestPage';
import BrowseRequestsPage from './pages/BrowseRequestsPage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import ChatPage from './pages/ChatPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import MyRequestsPage from './pages/MyRequestsPage';
import MessagesPage from './pages/MessagesPage';
import ActiveTasksPage from './pages/ActiveTasksPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRequests from './pages/admin/AdminRequests';
import AdminTransactions from './pages/admin/AdminTransactions';

import { useAuth } from './hooks/useAuth';

function AccessDenied() {
  return <div className="flex items-center justify-center min-h-screen text-2xl text-red-600">Access Denied</div>;
}

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Admin routes */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <AccessDenied />} />
        <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsers /> : <AccessDenied />} />
        <Route path="/admin/requests" element={user?.role === 'admin' ? <AdminRequests /> : <AccessDenied />} />
        <Route path="/admin/transactions" element={user?.role === 'admin' ? <AdminTransactions /> : <AccessDenied />} />
        {/* User routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/post-request" element={<ProtectedRoute><PostRequestPage /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><BrowseRequestsPage /></ProtectedRoute>} />
        <Route path="/request/:id" element={<ProtectedRoute><RequestDetailsPage /></ProtectedRoute>} />
        <Route path="/chat/:requestId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
        <Route path="/active-tasks" element={<ProtectedRoute><ActiveTasksPage /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
