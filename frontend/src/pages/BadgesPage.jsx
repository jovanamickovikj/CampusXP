import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import BadgeCard from '../components/BadgeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllBadges, getUserBadges } from '../api/badges.js';

export default function BadgesPage() {
  const { user } = useAuth();
  const [allBadges, setAllBadges]     = useState([]);
  const [userBadges, setUserBadges]   = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getAllBadges(), getUserBadges(user.id)])
      .then(([all, mine]) => { setAllBadges(all); setUserBadges(mine); })
      .finally(() => setLoading(false));
  }, [user.id]);

  const earnedIds = new Set(userBadges.map(ub => ub.badge.id));

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <span className="eyebrow">Your achievements</span>
          <h1>Badges</h1>
          <p>You've earned {userBadges.length} of {allBadges.length} badges</p>
        </div>

        {loading ? <LoadingSpinner /> : allBadges.length > 0 ? (
          <div className="badge-grid">
            {allBadges.map(badge => {
              const earned = userBadges.find(ub => ub.badge.id === badge.id);
              return (
                <div key={badge.id} style={{ opacity: earned ? 1 : 0.4 }}>
                  <BadgeCard badge={badge} earnedAt={earned?.earnedAt} />
                </div>
              );
            })}
          </div>
        ) : <EmptyState title="No badges defined yet" />}
      </main>
    </div>
  );
}
