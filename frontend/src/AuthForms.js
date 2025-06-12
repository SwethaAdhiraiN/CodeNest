import React, { useState } from 'react';
import './AuthForms.css';

// PUBLIC_INTERFACE
export function SignInForm({ onSubmit, loading = false, error = null }) {
  /** Render Sign In form for user authentication */
  const [form, setForm] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({}); // For displaying validation only onBlur/submit
  const [formError, setFormError] = useState(null);

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = 'Username is required';
    if (!form.password) errors.password = 'Password is required';
    return errors;
  };
  const errors = validate();

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };
  const handleBlur = (e) => {
    setTouched({...touched, [e.target.name]: true});
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({username: true, password: true});
    setFormError(null);
    if (Object.keys(validate()).length === 0 && !loading) {
      onSubmit && onSubmit(form).catch(err => setFormError(err.message));
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
      <h2>Sign In</h2>
      <div className="form-group">
        <label htmlFor="signin-username">Username</label>
        <input
          id="signin-username"
          name="username"
          autoFocus
          value={form.username}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="username"
        />
        {touched.username && errors.username &&
          <div className="form-error">{errors.username}</div>
        }
      </div>
      <div className="form-group">
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="current-password"
        />
        {touched.password && errors.password &&
          <div className="form-error">{errors.password}</div>
        }
      </div>
      <button
        type="submit"
        className="btn"
        disabled={loading || Object.keys(errors).length !== 0}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {formError && <div className="form-error">{formError}</div>}
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}

// PUBLIC_INTERFACE
export function SignUpForm({ onSubmit, loading = false, error = null }) {
  /** Render Sign Up form for user registration */
  const roles = ['contributor', 'viewer'];
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', role: '' });
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState(null);

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = 'Username is required';
    if (!form.password) errors.password = 'Password is required';
    if (form.password && form.password.length < 8)
      errors.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword)
      errors.confirmPassword = 'Confirm your password';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    if (!form.role) errors.role = 'Role is required';
    return errors;
  };
  const errors = validate();

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };
  const handleBlur = (e) => {
    setTouched({...touched, [e.target.name]: true});
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({username: true, password: true, confirmPassword: true, role: true});
    setFormError(null);
    if (Object.keys(validate()).length === 0 && !loading) {
      onSubmit && onSubmit(form).catch(err => setFormError(err.message));
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
      <h2>Sign Up</h2>
      <div className="form-group">
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          name="username"
          autoFocus
          value={form.username}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="username"
        />
        {touched.username && errors.username &&
          <div className="form-error">{errors.username}</div>
        }
      </div>
      <div className="form-group">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="new-password"
        />
        {touched.password && errors.password &&
          <div className="form-error">{errors.password}</div>
        }
      </div>
      <div className="form-group">
        <label htmlFor="signup-confirmPassword">Confirm Password</label>
        <input
          id="signup-confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="new-password"
        />
        {touched.confirmPassword && errors.confirmPassword &&
          <div className="form-error">{errors.confirmPassword}</div>
        }
      </div>
      <div className="form-group">
        <label htmlFor="signup-role">Role</label>
        <select
          id="signup-role"
          name="role"
          value={form.role}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
        >
          <option value="">Select a role...</option>
          {roles.map(option => (
            <option value={option} key={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
          ))}
        </select>
        {touched.role && errors.role && (
          <div className="form-error">{errors.role}</div>
        )}
      </div>
      <button
        type="submit"
        className="btn"
        disabled={loading || Object.keys(errors).length !== 0}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      {formError && <div className="form-error">{formError}</div>}
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
