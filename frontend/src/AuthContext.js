import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * AuthContext enables centralized management of JWT, user info, auth actions, and protects routes/UI based on authentication.
 */

// PUBLIC_INTERFACE
const AuthContext = createContext();

/**
 * AuthProvider wraps the app, exposing authentication state and actions (login, logout, register).
 */
export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("codenest_jwt") || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("codenest_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // For UI indicator: success message for sign-in/sign-up
  const [authSuccess, setAuthSuccess] = useState(null);

  // PUBLIC_INTERFACE
  const isAuthenticated = Boolean(authToken && currentUser);

  // PUBLIC_INTERFACE
  const login = useCallback(async ({ username, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      let body;
      try {
        body = await res.json();
      } catch {
        body = {};
      }
      if (!res.ok) {
        throw new Error(body.error || "Invalid username or password");
      }

      localStorage.setItem("codenest_jwt", body.token);
      localStorage.setItem("codenest_user", JSON.stringify(body.user));
      setAuthToken(body.token);
      setCurrentUser(body.user);
      setAuthLoading(false);
      setAuthError(null);

      // Set success message for sign in
      setAuthSuccess("Signed in successfully!");
      // Clear success after a short timeout (for possible feedback)
      setTimeout(() => setAuthSuccess(null), 1800);

      return body.user;
    } catch (err) {
      setAuthLoading(false);
      setAuthError(err.message || "Login failed");
      setAuthSuccess(null);
      throw err;
    }
  }, []);

  // PUBLIC_INTERFACE
  const register = useCallback(async ({ username, password, role }) => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      let body;
      try {
        body = await res.json();
      } catch {
        body = {};
      }
      if (!res.ok) {
        throw new Error(body.error || "Registration failed");
      }

      // Set success registration message (before auto login)
      setAuthSuccess("Registration successful! Signing in...");
      // Auto sign-in after registration
      await login({ username, password });

      setAuthLoading(false);
      setAuthError(null);

      return true;
    } catch (err) {
      setAuthLoading(false);
      setAuthError(err.message || "Registration failed");
      setAuthSuccess(null);
      throw err;
    }
  }, [login]);

  // PUBLIC_INTERFACE
  const logout = useCallback(() => {
    localStorage.removeItem("codenest_jwt");
    localStorage.removeItem("codenest_user");
    setAuthToken(null);
    setCurrentUser(null);
    setAuthError(null);
    setAuthSuccess(null);
    // Optionally: force reload to ensure all state resets, or navigate to auth view if using a router
    // window.location.reload();
  }, []);

  // Utility fetch wrapper to include JWT
  // PUBLIC_INTERFACE
  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };
      return fetch(url, { ...options, headers });
    },
    [authToken]
  );

  // Token/user sync between tabs
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === "codenest_jwt") setAuthToken(e.newValue);
      if (e.key === "codenest_user") setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // AuthContext value object
  const ctxValue = {
    authToken,
    currentUser,
    authLoading,
    authError,
    authSuccess, // feedback for the UI
    isAuthenticated,
    login,
    logout,
    register,
    authFetch,
  };

  return <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
/**
 * useAuth hook for accessing authentication state and actions anywhere in the app
 */
export function useAuth() {
  return useContext(AuthContext);
}
