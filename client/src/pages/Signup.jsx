import { useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/signup', { email, password });
      login(data.token, data.user.email);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign up</h2>
      {error && <p className="error">{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password (min 6 chars)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Create account</button>
      <p>Already have an account? <button type="button" className="link" onClick={onSwitch}>Log in</button></p>
    </form>
  );
}
