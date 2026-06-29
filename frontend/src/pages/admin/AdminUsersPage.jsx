import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, Clock, Shield, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Avatar from '../../components/Avatar.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getUsers, verifyShopManager, deleteUser } from '../../api/users.js';

function AccountTypeBadge({ user }) {
  if (user.role === 'ADMIN') {
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <Shield size={10} /> Admin
      </span>
    );
  }
  if (user.accountType === 'SHOP_MANAGER') {
    const colors = {
      VERIFIED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', icon: <BadgeCheck size={10} />, label: 'Shop Manager' },
      PENDING:  { color: 'var(--gold)', bg: 'rgba(255,202,85,0.1)', border: 'rgba(255,202,85,0.3)', icon: <Clock size={10} />, label: 'Pending Manager' },
      REJECTED: { color: 'var(--danger)', bg: 'rgba(255,90,123,0.08)', border: 'rgba(255,90,123,0.25)', icon: <X size={10} />, label: 'Rejected' },
    };
    const s = colors[user.verificationStatus] || colors.PENDING;
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 4, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        {s.icon} {s.label}
      </span>
    );
  }
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', border: '1px solid var(--panel-border)', borderRadius: 4, padding: '2px 8px' }}>
      Student
    </span>
  );
}

function DeleteConfirmRow({ user, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    await onConfirm(user.id);
  }

  return (
    <tr style={{ background: 'rgba(255,90,123,0.05)' }}>
      <td colSpan={4}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.25rem 0' }}>
          <Trash2 size={15} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem' }}>
            Delete <strong>{user.username}</strong>? This cannot be undone.
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button className="btn btn-danger btn-sm" onClick={confirm} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={deleting}>
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleVerify(userId, status) {
    setVerifyLoading(userId);
    try {
      const updated = await verifyShopManager(userId, status);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: updated.verificationStatus } : u));
      toast(status === 'VERIFIED' ? 'Shop manager approved!' : 'Application rejected.');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setVerifyLoading(null);
    }
  }

  async function handleDelete(userId) {
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast('User deleted.');
    } catch (err) {
      toast(err.message, 'error');
      setConfirmDeleteId(null);
    }
  }

  const shopManagerCount = users.filter(u => u.accountType === 'SHOP_MANAGER').length;
  const pendingCount     = users.filter(u => u.verificationStatus === 'PENDING').length;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <Link to="/admin" style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', marginBottom: '0.5rem' }}>
            <ArrowLeft size={13} /> Back to dashboard
          </Link>
          <span className="eyebrow">Administration</span>
          <h1>User Management</h1>
          <p>
            {users.length} registered users · {shopManagerCount} shop manager{shopManagerCount !== 1 ? 's' : ''}
            {pendingCount > 0 && ` · ${pendingCount} pending`}
          </p>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="panel">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Account type</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    confirmDeleteId === u.id ? (
                      <DeleteConfirmRow
                        key={u.id}
                        user={u}
                        onConfirm={handleDelete}
                        onCancel={() => setConfirmDeleteId(null)}
                      />
                    ) : (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Avatar user={u} size="sm" />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.fullName || u.username}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td><AccountTypeBadge user={u} /></td>
                        <td style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.85rem' }}>
                          {u.role === 'USER' && u.accountType === 'USER' ? `${u.currentPoints} XP` : '—'}
                        </td>
                        <td>
                          {u.role !== 'ADMIN' && (
                            <div className="flex-center gap-sm">
                              {/* Pending shop manager — show approve/reject */}
                              {u.accountType === 'SHOP_MANAGER' && u.verificationStatus === 'PENDING' && (
                                <>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', fontSize: '0.75rem' }}
                                    onClick={() => handleVerify(u.id, 'VERIFIED')}
                                    disabled={verifyLoading === u.id}
                                  >
                                    <BadgeCheck size={12} />
                                    {verifyLoading === u.id ? '…' : 'Approve'}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-ghost"
                                    style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                                    onClick={() => handleVerify(u.id, 'REJECTED')}
                                    disabled={verifyLoading === u.id}
                                  >
                                    <X size={12} /> Reject
                                  </button>
                                </>
                              )}
                              {/* Verified shop manager — allow revoking */}
                              {u.accountType === 'SHOP_MANAGER' && u.verificationStatus === 'VERIFIED' && (
                                <button
                                  className="btn btn-sm btn-ghost"
                                  style={{ color: 'var(--muted)', fontSize: '0.75rem' }}
                                  onClick={() => handleVerify(u.id, 'REJECTED')}
                                  disabled={verifyLoading === u.id}
                                >
                                  {verifyLoading === u.id ? '…' : 'Revoke access'}
                                </button>
                              )}
                              <button
                                className="btn btn-sm"
                                onClick={() => setConfirmDeleteId(u.id)}
                                title="Delete user"
                                style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
