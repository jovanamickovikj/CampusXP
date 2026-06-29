import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BadgeCheck, ChevronRight, Clock, ShoppingBag, UserCog, Users, X } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Avatar from '../../components/Avatar.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getUsers, getPendingManagers, verifyShopManager } from '../../api/users.js';
import { getAllItems } from '../../api/shop.js';
import { getAllBadges } from '../../api/badges.js';

function StatCard({ label, value, icon: Icon, to, color, sub }) {
  return (
    <Link to={to} className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-sm)', flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.1rem', opacity: 0.7 }}>{sub}</div>}
      </div>
      <ChevronRight size={15} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
    </Link>
  );
}

function PendingApplicationCard({ applicant, onApprove, onReject }) {
  const [busy, setBusy] = useState(false);

  async function act(status) {
    setBusy(true);
    try { await (status === 'VERIFIED' ? onApprove : onReject)(applicant.id); }
    finally { setBusy(false); }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 0', borderBottom: '1px solid var(--panel-border)',
    }}>
      <Avatar user={applicant} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{applicant.fullName || applicant.username}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>@{applicant.username}</div>
        {applicant.bio && (
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
            {applicant.bio}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
        <button
          className="btn btn-sm"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          onClick={() => act('VERIFIED')}
          disabled={busy}
        >
          <BadgeCheck size={13} /> Approve
        </button>
        <button
          className="btn btn-sm btn-ghost"
          style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          onClick={() => act('REJECTED')}
          disabled={busy}
        >
          <X size={13} /> Reject
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats,    setStats]    = useState(null);
  const [pending,  setPending]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getAllItems(), getAllBadges(), getPendingManagers()])
      .then(([users, items, badges, pendingList]) => {
        const shopManagers = users.filter(u => u.accountType === 'SHOP_MANAGER').length;
        const regular      = users.filter(u => u.role === 'USER' && u.accountType === 'USER').length;
        setStats({
          totalUsers:   users.length,
          regularUsers: regular,
          shopManagers,
          activeItems:  items.filter(i => i.active).length,
          totalItems:   items.length,
          totalBadges:  badges.length,
        });
        setPending(pendingList);
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(userId) {
    try {
      await verifyShopManager(userId, 'VERIFIED');
      setPending(p => p.filter(u => u.id !== userId));
      toast('Shop manager approved!', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleReject(userId) {
    try {
      await verifyShopManager(userId, 'REJECTED');
      setPending(p => p.filter(u => u.id !== userId));
      toast('Application rejected.');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <span className="eyebrow">Administration</span>
          <h1>Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Pending Applications Banner */}
            {pending.length > 0 && (
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1.25rem',
                background: 'rgba(255,202,85,0.08)', border: '1px solid rgba(255,202,85,0.3)',
                borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.85rem', color: 'var(--gold)',
              }}>
                <Clock size={15} />
                {pending.length} pending shop manager application{pending.length !== 1 ? 's' : ''} — see below
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard
                label="Registered users"
                value={stats.totalUsers}
                sub={`${stats.regularUsers} students · ${stats.shopManagers} shop manager${stats.shopManagers !== 1 ? 's' : ''}`}
                icon={Users}
                to="/admin/users"
                color="var(--accent)"
              />
              <StatCard
                label="Shop items"
                value={stats.activeItems}
                sub={`${stats.totalItems - stats.activeItems} inactive`}
                icon={ShoppingBag}
                to="/admin/shop"
                color="var(--gold)"
              />
              <StatCard
                label="Total badges"
                value={stats.totalBadges}
                icon={Award}
                to="/admin"
                color="var(--green)"
              />
            </div>

            {/* Pending Applications Section */}
            {pending.length > 0 && (
              <div className="panel" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={15} style={{ color: 'var(--gold)' }} />
                  <p className="panel-title" style={{ margin: 0 }}>Pending Shop Manager Applications</p>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,202,85,0.18)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 99 }}>
                    {pending.length}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                  Review and approve or reject each application. Approved managers gain immediate access to shop management.
                </p>
                {pending.map(applicant => (
                  <PendingApplicationCard
                    key={applicant.id}
                    applicant={applicant}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}

            {/* Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <UserCog size={16} style={{ color: 'var(--accent)' }} />
                  <p className="panel-title" style={{ margin: 0 }}>User Management</p>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  View all registered students, manage shop manager applications, and remove accounts.
                </p>
                <Link to="/admin/users" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex' }}>
                  <Users size={13} /> Manage users
                </Link>
              </div>

              <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShoppingBag size={16} style={{ color: 'var(--gold)' }} />
                  <p className="panel-title" style={{ margin: 0 }}>Shop Management</p>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Add, edit, or deactivate shop items. Verified shop managers also manage their own items.
                </p>
                <Link to="/admin/shop" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex' }}>
                  <ShoppingBag size={13} /> Manage shop
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
