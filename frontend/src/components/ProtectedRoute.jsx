import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)    return <Navigate to="/dashboard" replace />;
  return children;
}

/** Shop management route: accessible by ADMIN or VERIFIED shop managers only. */
export function ShopManagerRoute({ children }) {
  const { isLoggedIn, isAdmin, isVerifiedShopManager } = useAuth();
  const location = useLocation();

  if (!isLoggedIn)                        return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin && !isVerifiedShopManager) return <Navigate to="/dashboard" replace />;
  return children;
}
