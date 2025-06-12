// App.js: Main app shell. Uses AuthContext to manage authentication state across the app.

import React, { useState } from 'react';
import { SignInForm, SignUpForm } from './AuthForms';
import './AuthForms.css';
import { AuthProvider, useAuth } from './AuthContext';

/**
 * Updated App function (wrapped in AuthProvider) uses AuthContext for session state and actions.
 * Protects UI based on authentication and allows for extension to protect routes.
 */
function AppShell() {
  const [view, setView] = useState("signin"); // 'signin' | 'signup'
  const {
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    authLoading,
    authError,
    authFetch,
  } = useAuth();

  // Demo: Call a protected API endpoint to show session state, once logged in.
  // You can remove this or extend to actual main routes.
  const [me, setMe] = useState(null);
  const [fetchingMe, setFetchingMe] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  async function fetchMe() {
    setFetchingMe(true);
    setFetchError(null);
    try {
      const res = await authFetch("/api/auth/me");
      if (!res.ok) {
        let body;
        try { body = await res.json(); } catch { body = {}; }
        throw new Error(body.error || "Could not fetch user info");
      }
      const data = await res.json();
      setMe(data.user);
      setFetchingMe(false);
    } catch (err) {
      setFetchError(err.message);
      setFetchingMe(false);
    }
  }

  // After signing in, optionally fetch /me info
  React.useEffect(() => {
    if (isAuthenticated) { fetchMe(); }
    else { setMe(null); }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  // Render logged-in state
  if (isAuthenticated && currentUser) {
    return (
      <div className="auth-form" style={{ maxWidth: 480, margin: "64px auto" }}>
        <h2>Welcome, {currentUser.username}!</h2>
        <p style={{ textAlign: "center" }}>
          Signed in as <b>{currentUser.role}</b>
        </p>
        <button
          className="btn"
          onClick={logout}
          style={{ margin: "2em auto 0", display: "block" }}
        >
          Sign Out
        </button>
        {/* Example of protected API call */}
        <button
          className="btn btn-secondary"
          style={{ marginTop: "1.2em" }}
          onClick={fetchMe}
          disabled={fetchingMe}
        >
          {fetchingMe ? "Fetching profile..." : "Test /api/auth/me"}
        </button>
        {me && (
          <div style={{ marginTop: 10, fontSize: "1.07em" }}>
            <b>Your Info:</b> <pre style={{ background: "#f4f6fa", padding: "0.45em" }}>{JSON.stringify(me, null, 2)}</pre>
          </div>
        )}
        {fetchError && <div className="form-error">{fetchError}</div>}
      </div>
    );
  }

  // Render authentication forms if not logged in
  return (
    <div>
      <nav style={{ display: "flex", justifyContent: "center", marginBottom: "2em", gap: "1em" }}>
        <button
          className={`btn${view === "signin" ? "" : " btn-secondary"}`}
          style={{ minWidth: 100 }}
          onClick={() => setView("signin")}
          disabled={view === "signin"}
        >
          Sign In
        </button>
        <button
          className={`btn${view === "signup" ? "" : " btn-secondary"}`}
          style={{ minWidth: 100 }}
          onClick={() => setView("signup")}
          disabled={view === "signup"}
        >
          Sign Up
        </button>
      </nav>
      {view === "signin" ? (
        <SignInForm onSubmit={login} loading={authLoading} error={authError} />
      ) : (
        <SignUpForm onSubmit={register} loading={authLoading} error={authError} />
      )}
    </div>
  );
}

// The top-level App component is now simply a provider wrapper.
function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
