import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const ChatPage = () => {
  const { requestId } = useParams();
  const { user } = useAuth();
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
    if (!user || !user.uid || !text.trim()) return;
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col items-center bg-gray-50 p-6">
        <div className="w-full max-w-2xl bg-white rounded shadow p-6 flex flex-col h-[70vh]">
          <h2 className="text-xl font-bold mb-4">Chat</h2>
          <div className="flex-1 overflow-y-auto mb-4 border p-2 rounded bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`mb-2 ${msg.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-3 py-1 rounded ${msg.senderId === user.uid ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex">
            <input value={text} onChange={e => setText(e.target.value)} className="flex-1 border rounded-l p-2" placeholder="Type a message..." />
            <button type="submit" className="bg-blue-600 text-white px-4 rounded-r">Send</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
