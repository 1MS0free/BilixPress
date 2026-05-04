import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="flex items-center gap-2 text-black hover:underline mb-4"
    >
      <span className="inline-block">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
      {label}
    </button>
  );
};

export default BackButton;
