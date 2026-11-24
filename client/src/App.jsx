import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Chat from './pages/Chat.jsx';

function Gate() {
  const { token } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (token) return <Chat />;

  return showSignup
    ? <Signup onSwitch={() => setShowSignup(false)} />
    : <Login onSwitch={() => setShowSignup(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Gate />
      </div>
    </AuthProvider>
  );
}
