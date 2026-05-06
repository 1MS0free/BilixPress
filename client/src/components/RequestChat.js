import React, { useEffect, useState, useRef } from 'react';
import {
  collection, addDoc, query, where,
  orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const RequestChat = ({ requestId, user, receiverId, disabled = false }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!requestId) return;
    const q = query(
      collection(db, 'messages'),
      where('requestId', '==', requestId),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!user?.uid || !text.trim() || disabled) return;
    await addDoc(collection(db, 'messages'), {
      requestId,
      senderId: user.uid,
      receiverId: receiverId || null,
      text: text.trim(),
      createdAt: serverTimestamp(),
      system: false,
    });
    setText('');
  };

  if (!user?.uid) return <div className="text-gray-500">Please log in to chat.</div>;

  return (
    <div className="flex flex-col h-80">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-3 border rounded p-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm italic mt-8">
            No messages yet. Say hello! 👋
          </p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-2 flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
            >
              {msg.system ? (
                <span className="text-xs italic text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 max-w-xs text-center">
                  {msg.text}
                </span>
              ) : (
                <span className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-xs break-words
                  ${msg.senderId === user.uid
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </span>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Completed banner */}
      {disabled && (
        <p className="text-xs text-center text-gray-400 italic mb-2">
          This request is completed. Chat is now closed.
        </p>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={disabled}
          className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
          placeholder={disabled ? 'Chat closed.' : 'Type a message...'}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition
            ${disabled || !text.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Send
        </button>
      </form>

    </div>
  );
};

export default RequestChat;
