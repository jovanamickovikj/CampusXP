import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, Medal, Zap } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getLeaderboard } from '../api/leaderboard.js';

function rankLabel(i) {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return `#${i + 1}`;
}

export default function LeaderboardPage() {
  const { user }   = useAuth();
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(data => setRows(data.filter(u => u.role === 'USER' && (!u.accountType || u.accountType === 'USER'))))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <span className="eyebrow">Rankings</span>
          <h1>Leaderboard</h1>
          <p>Top students ranked by total XP earned</p>
        </div>

        {loading ? <LoadingSpinner /> : rows.length > 0 ? (
          <div className="leaderboard-list">
            {rows.map((u, i) => (
              <div key={u.id} className={`leaderboard-row ${u.id === user?.id ? 'me' : ''}`}>
                <span className={`rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}>
                  {rankLabel(i)}
                </span>
                <Link to={u.id === user?.id ? '/profile' : `/profile/${u.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <Avatar user={u} size="sm" />
                </Link>
                <Link to={u.id === user?.id ? '/profile' : `/profile/${u.id}`} className="leaderboard-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {u.fullName}
                  <span>@{u.username}</span>
                </Link>
                <div className="flex-center gap-sm">
                  <span className="xp-chip gold" style={{ fontSize: '0.75rem' }}>
                    <Zap size={11} /> {u.totalEarnedPoints} total
                  </span>
                  <span className="xp-chip" style={{ fontSize: '0.75rem' }}>
                    <Coins size={11} /> {u.currentPoints}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No data yet" />}
      </main>
    </div>
  );
}
