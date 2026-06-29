import { NavLink } from 'react-router-dom';
import {
  BadgeCheck, Clock, Coins, Home, LogOut, Medal,
  Package, Settings, ShoppingBag, Trophy, Users, UserCog,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

/** Links shown to regular students (ROLE_USER, accountType USER). */
const userLinks = [
  { to: '/dashboard',   label: 'Home',        icon: Home },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/shop',        label: 'Shop',        icon: ShoppingBag },
  { to: '/inventory',   label: 'Inventory',   icon: Package },
  { to: '/friends',     label: 'Friends',     icon: Users },
];

/** Links shown to verified shop managers (ROLE_USER, accountType SHOP_MANAGER, VERIFIED). */
const shopManagerLinks = [
  { to: '/admin/shop',  label: 'Shop Management',  icon: ShoppingBag },
];

/** Links for pending/rejected shop managers — no shop access yet. */
const pendingManagerLinks = [];

/** Links shown to admins. */
const adminLinks = [
  { to: '/admin',        label: 'Dashboard', icon: Settings },
  { to: '/admin/users',  label: 'Users',     icon: UserCog },
  { to: '/admin/shop',   label: 'Shop',      icon: ShoppingBag },
];

export default function Navbar({ points }) {
  const {
    user, isAdmin,
    isShopManager, isVerifiedShopManager, isPendingShopManager,
    logout,
  } = useAuth();

  const isPrivileged = isAdmin || isShopManager;

  let links;
  if (isAdmin)                      links = adminLinks;
  else if (isVerifiedShopManager)   links = shopManagerLinks;
  else if (isShopManager)           links = pendingManagerLinks; // pending or rejected
  else                              links = userLinks;

  return (
    <header className="navbar">
      <NavLink className="brand" to={isAdmin ? '/admin' : '/dashboard'}>
        <Medal size={20} />
        <span>CampusXP</span>
        {isAdmin && <span className="role-badge role-admin">Admin</span>}
        {isVerifiedShopManager && (
          <span className="role-badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
            <BadgeCheck size={11} /> Shop Manager
          </span>
        )}
        {isPendingShopManager && (
          <span className="role-badge" style={{ background: 'rgba(255,202,85,0.12)', color: 'var(--gold)', border: '1px solid rgba(255,202,85,0.3)' }}>
            <Clock size={11} /> Pending
          </span>
        )}
      </NavLink>

      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex-center gap-sm">
        {/* Only show XP for regular students */}
        {!isPrivileged && points !== undefined && (
          <span className="nav-points">
            <Coins size={13} />
            {points} XP
          </span>
        )}
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Avatar user={user} size="sm" />
          <span>{user?.username}</span>
        </NavLink>
        <button className="nav-logout" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
