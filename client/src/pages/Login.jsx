import { useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user.email);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Log in</h2>
      {error && <p className="error">{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Log in</button>
      <p>No account? <button type="button" className="link" onClick={onSwitch}>Sign up</button></p>
    </form>
  );
}
