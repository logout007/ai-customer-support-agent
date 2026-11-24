import { useEffect, useRef, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Chat() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState('');
  const { email, logout } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/chat/history')
      .then(({ data }) => setHistory(data))
      .catch(() => setError('Could not load your past messages'))
      .finally(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !historyLoaded) return;

    setError('');
    setInput('');
    setSending(true);
    setHistory((h) => [...h, { message: text, reply: null }]);

    try {
      const { data } = await api.post('/chat/send', { message: text });
      setHistory((h) => [...h.slice(0, -1), data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
      setHistory((h) => h.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <span>Signed in as {email}</span>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="chat-messages">
        {history.map((m, i) => (
          <div key={i} className="chat-pair">
            <div className="bubble user">{m.message}</div>
            {m.reply === null
              ? <div className="bubble ai typing">AI is typing…</div>
              : <div className="bubble ai">{m.reply}</div>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="error">{error}</p>}

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending || !historyLoaded}
        />
        <button type="submit" disabled={sending || !historyLoaded}>Send</button>
      </form>
    </div>
  );
}
