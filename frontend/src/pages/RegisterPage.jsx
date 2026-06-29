import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserPlus, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ color: 'var(--danger, #f87171)', fontSize: '0.76rem', margin: '0.25rem 0 0' }}>{msg}</p>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ username: '', email: '', fullName: '', password: '', confirm: '' });
  const [accountType, setAccountType] = useState('USER');
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Clear the error for this field as the user types
    setFieldErrors(p => ({ ...p, [name]: '' }));
  }

  function validate() {
    const errs = {};

    if (!form.fullName.trim())
      errs.fullName = 'Please enter your full name.';

    if (!form.username.trim())
      errs.username = 'Please enter a username.';
    else if (form.username.trim().length < 3)
      errs.username = 'Username must be at least 3 characters long.';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim()))
      errs.username = 'Username may only contain letters, numbers, and underscores.';

    if (!form.email.trim())
      errs.email = 'Please enter your email address.';
    else if (!EMAIL_RE.test(form.email.trim()))
      errs.email = 'Please enter a valid email address.';

    if (!form.password)
      errs.password = 'Please enter a password.';
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters long.';

    if (!form.confirm)
      errs.confirm = 'Please confirm your password.';
    else if (form.confirm !== form.password)
      errs.confirm = 'Passwords do not match.';

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.fullName.trim(), form.password, accountType);
      if (accountType === 'SHOP_MANAGER') {
        navigate('/login', { replace: true, state: { notice: 'Account created! Your application is pending admin review. Please log in.' } });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.message || '';
      // Route known server errors to the relevant field
      if (msg.toLowerCase().includes('username already taken')) {
        setFieldErrors(p => ({ ...p, username: 'This username is already taken. Please choose a different one.' }));
      } else if (msg.toLowerCase().includes('email already taken')) {
        setFieldErrors(p => ({ ...p, email: 'An account with this email already exists.' }));
      } else {
        setGlobalError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: 'fullName', label: 'Full name',       type: 'text',     placeholder: 'Jane Smith' },
    { name: 'username', label: 'Username',         type: 'text',     placeholder: 'jane_smith' },
    { name: 'email',    label: 'Email',            type: 'email',    placeholder: 'jane@example.com' },
    { name: 'password', label: 'Password',         type: 'password', placeholder: '••••••••',
      hint: 'At least 8 characters' },
    { name: 'confirm',  label: 'Confirm password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <h1>CampusXP</h1>
          <p>Create your account</p>
        </div>

        {globalError && <div className="auth-error">{globalError}</div>}

        {/* Account type selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            Account type
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {[
              {
                value: 'USER',
                label: 'Student',
                desc: 'Earn XP, buy from the shop, and connect with friends',
                icon: GraduationCap,
              },
              {
                value: 'SHOP_MANAGER',
                label: 'Shop Manager',
                desc: 'Apply to manage the campus shop (requires admin approval)',
                icon: ShoppingBag,
              },
            ].map(({ value, label, desc, icon: Icon }) => {
              const selected = accountType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAccountType(value)}
                  style={{
                    padding: '0.85rem 0.75rem',
                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--panel-border)'}`,
                    borderRadius: 'var(--radius)',
                    background: selected ? 'rgba(100,180,255,0.07)' : 'var(--panel)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <Icon size={14} style={{ color: selected ? 'var(--accent)' : 'var(--muted)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selected ? 'var(--accent)' : 'var(--text)' }}>
                      {label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
                </button>
              );
            })}
          </div>
          {accountType === 'SHOP_MANAGER' && (
            <div style={{ marginTop: '0.6rem', padding: '0.55rem 0.75rem', background: 'rgba(255,202,85,0.08)', border: '1px solid rgba(255,202,85,0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--gold)', lineHeight: 1.5 }}>
              Your application will be reviewed by an admin. You can still post and connect with friends while pending.
            </div>
          )}
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {fields.map(f => (
            <div className="form-group" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                style={fieldErrors[f.name] ? { borderColor: 'var(--danger, #f87171)' } : {}}
              />
              {f.hint && !fieldErrors[f.name] && (
                <p style={{ color: 'var(--muted)', fontSize: '0.74rem', margin: '0.2rem 0 0' }}>{f.hint}</p>
              )}
              <FieldError msg={fieldErrors[f.name]} />
            </div>
          ))}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            <UserPlus size={16} />
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
