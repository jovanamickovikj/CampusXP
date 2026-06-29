import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, LockKeyhole, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ color: 'var(--danger, #f87171)', fontSize: '0.76rem', margin: '0.25rem 0 0' }}>{msg}</p>;
}

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const notice      = location.state?.notice || '';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  function validate() {
    const errs = {};
    if (!username.trim())   errs.username = 'Please enter your username.';
    if (!password)          errs.password = 'Please enter your password.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters long.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { accountType } = await login(username.trim(), password);
      navigate(accountType === 'SHOP_MANAGER' ? '/profile' : '/dashboard', { replace: true });
    } catch (err) {
      // Normalise backend messages into user-friendly copy
      const msg = err.message || '';
      if (msg.toLowerCase().includes('bad credentials') || msg.toLowerCase().includes('invalid')) {
        setError('Incorrect username or password. Please try again.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--panel-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    padding: '0.6rem 0.85rem',
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <h1>CampusXP</h1>
          <p>Earn XP, unlock rewards, climb the leaderboard</p>
        </div>

        {notice && (
          <div style={{ background: 'rgba(99,226,120,0.1)', border: '1px solid rgba(99,226,120,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', fontSize: '0.82rem', color: 'var(--success, #4ade80)', marginBottom: '1rem', lineHeight: 1.5 }}>
            {notice}
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="flex-center gap-sm">
              <User size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: '' })); }}
                placeholder="your_username"
                autoFocus
                style={{ ...inputStyle, borderColor: errors.username ? 'var(--danger, #f87171)' : undefined }}
              />
            </div>
            <FieldError msg={errors.username} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="flex-center gap-sm">
              <LockKeyhole size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="••••••••"
                style={{ ...inputStyle, borderColor: errors.password ? 'var(--danger, #f87171)' : undefined }}
              />
            </div>
            <FieldError msg={errors.password} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            <LogIn size={16} />
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>

        <div className="divider" style={{ marginTop: '1.5rem' }} />
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
          Demo: <strong>jovana</strong> / password123 &nbsp;·&nbsp; <strong>admin</strong> / admin123
        </p>
      </div>
    </div>
  );
}
