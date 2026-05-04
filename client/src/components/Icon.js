// src/components/Icon.js
import React from 'react';

const icons = {
  dashboard: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" fill="#2563eb"/><rect x="14" y="3" width="7" height="7" rx="2" fill="#2563eb"/><rect x="14" y="14" width="7" height="7" rx="2" fill="#2563eb"/><rect x="3" y="14" width="7" height="7" rx="2" fill="#2563eb"/></svg>
  ),
  post: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  requests: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#2563eb"/></svg>
  ),
  messages: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#2563eb" strokeWidth="2"/></svg>
  ),
  history: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  settings: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/><path d="M12 8v4l3 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  logout: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="7" height="18" rx="2" stroke="#2563eb" strokeWidth="2"/></svg>
  ),
};

const Icon = ({ name }) => icons[name] || null;

export default Icon;
