import React, { useState } from 'react';
import { SignInForm, SignUpForm } from './AuthForms';
import './AuthForms.css';

// PUBLIC_INTERFACE
function App() {
  /** Root component for CodeNest frontend with authentication UI */
  const [view, setView] = useState('signin'); // 'signin' | 'signup'
  // Placeholders for future API state
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Placeholder: onSubmit handler (to be implemented with backend integration)
  const handleSignIn = async ({ username, password }) => {
    setLoading(true);
    setAuthError(null);
    // Next step: call backend API here
    setTimeout(() => {
      setLoading(false);
      // setAuthError('Invalid username or password');
    }, 600);
  };

  const handleSignUp = async ({ username, password, role }) => {
    setLoading(true);
    setAuthError(null);
    // Next step: call backend API here
    setTimeout(() => {
      setLoading(false);
      // setAuthError('Username already exists');
    }, 600);
  };

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'center', marginBottom: '2em', gap: '1em' }}>
        <button
          className={`btn${view === 'signin' ? '' : ' btn-secondary'}`}
          style={{minWidth: 100}}
          onClick={() => setView('signin')}
          disabled={view === 'signin'}
        >
          Sign In
        </button>
        <button
          className={`btn${view === 'signup' ? '' : ' btn-secondary'}`}
          style={{minWidth: 100}}
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
