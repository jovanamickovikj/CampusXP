import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, AdminRoute, ShopManagerRoute } from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import LoginPage          from './pages/LoginPage.jsx';
import RegisterPage       from './pages/RegisterPage.jsx';
import DashboardPage      from './pages/DashboardPage.jsx';
import ProfilePage        from './pages/ProfilePage.jsx';
import UserProfilePage    from './pages/UserProfilePage.jsx';
import ShopPage           from './pages/ShopPage.jsx';
import ShopItemPage       from './pages/ShopItemPage.jsx';
import InventoryPage      from './pages/InventoryPage.jsx';
import LeaderboardPage    from './pages/LeaderboardPage.jsx';
import FriendsPage        from './pages/FriendsPage.jsx';
import BadgesPage         from './pages/BadgesPage.jsx';
import AdminDashboard     from './pages/admin/AdminDashboard.jsx';
import AdminShopPage      from './pages/admin/AdminShopPage.jsx';
import AdminUsersPage     from './pages/admin/AdminUsersPage.jsx';
import NotFoundPage       from './pages/NotFoundPage.jsx';

export default function App() {
  const { isLoggedIn, isShopManager } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Navigate to={!isLoggedIn ? '/login' : isShopManager ? '/profile' : '/dashboard'} replace />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected — any logged-in user */}
      <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/shop"        element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
      <Route path="/shop/:id"    element={<ProtectedRoute><ShopItemPage /></ProtectedRoute>} />
      <Route path="/inventory"   element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/friends"     element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
      <Route path="/badges"      element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />

      {/* Admin + verified shop managers */}
      <Route path="/admin/shop"  element={<ShopManagerRoute><AdminShopPage /></ShopManagerRoute>} />

      {/* Admin only */}
      <Route path="/admin"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
