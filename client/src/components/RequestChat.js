import React, { useEffect, useState, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const RequestChat = ({ requestId, user, disabled = false }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
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
    if (!user || !user.uid || !text.trim() || disabled) return;
    await addDoc(collection(db, 'messages'), {
      requestId,
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
    });
    setText('');
  };

  if (!user || !user.uid) return <div className="text-gray-500">Please log in to chat.</div>;

  return (
    <div className="flex flex-col h-80">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-4 border p-2 rounded bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm italic mt-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-2 ${msg.senderId === user.uid ? 'text-right' : 'text-left'}`}
            >
              {msg.system ? (
                <span className="inline-block px-3 py-1 rounded bg-yellow-50 text-yellow-700 text-xs italic">
                  {msg.text}
                </span>
              ) : (
                <span
                  className={`inline-block px-3 py-1 rounded ${
                    msg.senderId === user.uid
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-800'
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

      {/* Input form */}
      <form onSubmit={sendMessage} className="flex">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className={`flex-1 border rounded-l p-2 text-sm ${
            disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''
          }`}
          placeholder={disabled ? 'Chat closed.' : 'Type a message...'}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled}
          className={`px-4 rounded-r text-white text-sm font-medium ${
            disabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          Send
        </button>
      </form>

    </div>
  );
};

export default RequestChat;
