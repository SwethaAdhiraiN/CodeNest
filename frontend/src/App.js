import React, { useState } from 'react';
import { SignInForm, SignUpForm } from './AuthForms';
import './AuthForms.css';

// PUBLIC_INTERFACE
function App() {
  /** Root component for CodeNest frontend with authentication UI */
  const [view, setView] = useState('signin'); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('codenest_jwt') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('codenest_user');
    return stored ? JSON.parse(stored) : null;
  });

  // PUBLIC_INTERFACE
  const handleSignIn = async ({ username, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        // Try to extract message from response, fallback to default error
        let body;
        try { body = await res.json(); } catch { body = {}; }
        throw new Error(body.error || 'Invalid username or password');
      }
      const data = await res.json();
      // Store JWT in localStorage and set current user
      localStorage.setItem('codenest_jwt', data.token);
      localStorage.setItem('codenest_user', JSON.stringify(data.user));
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setLoading(false);
      setAuthError(null);
    } catch (err) {
      setLoading(false);
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  // PUBLIC_INTERFACE
  const handleSignUp = async ({ username, password, role }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (!res.ok) {
        let body;
        try { body = await res.json(); } catch { body = {}; }
        throw new Error(body.error || 'Registration failed');
      }
      // Optionally auto-login after registration:
      await handleSignIn({ username, password });
      setLoading(false);
      setAuthError(null);
      setView('signin'); // Or keep user signed in/view switch as needed
    } catch (err) {
      setLoading(false);
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  // PUBLIC_INTERFACE
  const handleSignOut = () => {
    localStorage.removeItem('codenest_jwt');
    localStorage.removeItem('codenest_user');
    setAuthToken(null);
    setCurrentUser(null);
    setView('signin');
    setAuthError(null);
  };

  // Render a minimalist post-login state (shows signed-in user and sign-out)
  if (authToken && currentUser) {
    return (
      <div className="auth-form" style={{ maxWidth: 480, margin: '64px auto' }}>
        <h2>Welcome, {currentUser.username}!</h2>
        <p style={{ textAlign: 'center' }}>
          Signed in as <b>{currentUser.role}</b>
        </p>
        <button className="btn" onClick={handleSignOut} style={{ margin: '2em auto 0', display: 'block' }}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'center', marginBottom: '2em', gap: '1em' }}>
        <button
          className={`btn${view === 'signin' ? '' : ' btn-secondary'}`}
          style={{ minWidth: 100 }}
          onClick={() => setView('signin')}
          disabled={view === 'signin'}
        >
          Sign In
        </button>
        <button
          className={`btn${view === 'signup' ? '' : ' btn-secondary'}`}
          style={{ minWidth: 100 }}
          onClick={() => setView('signup')}
          disabled={view === 'signup'}
        >
          Sign Up
        </button>
      </nav>
      {view === 'signin' ? (
        <SignInForm onSubmit={handleSignIn} loading={loading} error={authError} />
      ) : (
        <SignUpForm onSubmit={handleSignUp} loading={loading} error={authError} />
      )}
    </div>
  );
}

export default App;
