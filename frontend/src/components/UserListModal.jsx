import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Search, UserMinus, X } from 'lucide-react';
import Avatar from './Avatar.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Generic modal that displays a list of users (friends, following, followers).
 *
 * @param {string}   title        - Modal heading (e.g. "Friends", "Following", "Followers")
 * @param {Array}    users        - Array of UserSummaryResponse objects
 * @param {boolean}  loading      - Whether data is still loading
 * @param {function} onClose      - Called when the modal should close
 * @param {function} onAction     - Optional: called with (userId) when the action button is clicked (uniform action)
 * @param {string}   actionLabel  - Label for the uniform action button (e.g. "Unfriend", "Unfollow")
 * @param {function} renderAction - Optional: (user) => ReactNode — per-user custom action button(s)
 */
export default function UserListModal({ title, users = [], loading, onClose, onAction, actionLabel, renderAction }) {
  const [query,    setQuery]    = useState('');
  const [removing, setRemoving] = useState(new Set());

  const q = query.trim().toLowerCase();
  const filtered = q
    ? users.filter(u =>
        (u.fullName  || '').toLowerCase().includes(q) ||
        (u.username  || '').toLowerCase().includes(q)
      )
    : users;

  async function handleAction(e, userId) {
    e.preventDefault();
    e.stopPropagation();
    if (removing.has(userId)) return;
    setRemoving(prev => new Set(prev).add(userId));
    try {
      await onAction(userId);
    } finally {
      setRemoving(prev => { const next = new Set(prev); next.delete(userId); return next; });
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="panel"
        style={{ width: '100%', maxWidth: 420, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="flex-center gap-sm" style={{ marginBottom: '0.75rem', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, flex: 1, margin: 0 }}>{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--input-bg, rgba(255,255,255,0.06))',
          border: '1px solid var(--panel-border)',
          borderRadius: 'var(--radius)',
          padding: '0.45rem 0.75rem',
          marginBottom: '0.85rem',
          flexShrink: 0,
          transition: 'border-color 0.15s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent, #6366f1)'}
          onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--panel-border)'}
        >
          <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or username…"
            autoFocus
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: '0.83rem', flex: 1, minWidth: 0,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
              {q ? `No results for "${q}".` : 'Nobody here yet.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {filtered.map(u => (
                <div key={u.id} className="friend-row" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <Link
                    to={`/profile/${u.id}`}
                    onClick={onClose}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}
                  >
                    <Avatar user={u} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {u.fullName || u.username}
                        {u.accountType === 'SHOP_MANAGER' && u.verificationStatus === 'VERIFIED' && (
                          <BadgeCheck size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>@{u.username}</div>
                    </div>
                  </Link>

                  {renderAction
                    ? <div style={{ flexShrink: 0 }}>{renderAction(u)}</div>
                    : onAction && actionLabel && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.75rem', color: 'var(--muted)', flexShrink: 0 }}
                        onClick={e => handleAction(e, u.id)}
                        disabled={removing.has(u.id)}
                        title={actionLabel}
                      >
                        <UserMinus size={13} />
                        {removing.has(u.id) ? '…' : actionLabel}
                      </button>
                    )
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
