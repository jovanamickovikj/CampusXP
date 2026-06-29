import { createContext, useContext, useState } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'campusxp_token';
const USER_KEY    = 'campusxp_user';

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  function persist(userData, token) {
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  async function login(username, password) {
    const res = await authApi.login(username, password);
    persist({
      id: res.userId,
      username: res.username,
      fullName: res.fullName,
      avatarUrl: res.avatarUrl || null,
      role: res.role,
      accountType: res.accountType,
      verificationStatus: res.verificationStatus,
    }, res.token);
    return { accountType: res.accountType, role: res.role };
  }

  async function register(username, email, fullName, password, accountType) {
    const res = await authApi.register(username, email, fullName, password, accountType);
    persist({
      id: res.userId,
      username: res.username,
      fullName: res.fullName,
      avatarUrl: res.avatarUrl || null,
      role: res.role,
      accountType: res.accountType,
      verificationStatus: res.verificationStatus,
    }, res.token);
  }

  function logout() {
    clear();
  }

  function refreshUser(updates) {
    const updated = { ...user, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  const role               = user?.role;
  const accountType        = user?.accountType;
  const verificationStatus = user?.verificationStatus;

  const isAdmin                = role === 'ADMIN';
  const isShopManager          = accountType === 'SHOP_MANAGER';
  const isVerifiedShopManager  = isShopManager && verificationStatus === 'VERIFIED';
  const isPendingShopManager   = isShopManager && verificationStatus === 'PENDING';
  const isRejectedShopManager  = isShopManager && verificationStatus === 'REJECTED';

  /** True for admin and ANY shop manager (any verification status). */
  const isPrivileged = isAdmin || isShopManager;

  return (
    <AuthContext.Provider value={{
      user,
      role,
      accountType,
      verificationStatus,
      isLoggedIn:             !!user,
      isAdmin,
      isShopManager,
      isVerifiedShopManager,
      isPendingShopManager,
      isRejectedShopManager,
      isPrivileged,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
