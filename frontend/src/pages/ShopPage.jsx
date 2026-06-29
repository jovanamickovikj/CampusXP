import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ShopItemCard from '../components/ShopItemCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getShopItems } from '../api/shop.js';
import { getProfile } from '../api/users.js';

export default function ShopPage() {
  const { user } = useAuth();
  const [items, setItems]     = useState([]);
  const [profile, setProfile] = useState(null);
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getShopItems(), getProfile(user.id)])
      .then(([shopItems, p]) => { setItems(shopItems); setProfile(p); })
      .finally(() => setLoading(false));
  }, [user.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter(i => `${i.name} ${i.description}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  return (
    <div className="app-layout">
      <Navbar points={profile?.currentPoints} />
      <main className="page-content">
        <div className="page-header">
          <span className="eyebrow">Redeem rewards</span>
          <h1>Campus Shop</h1>
          <p>Spend your XP on exclusive campus perks</p>
        </div>

        <div className="page-actions">
          <div className="search-bar">
            <Search size={15} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search items…"
            />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : filtered.length > 0 ? (
          <div className="shop-grid">
            {filtered.map(item => (
              <ShopItemCard key={item.id} item={item} userPoints={profile?.currentPoints ?? 0} />
            ))}
          </div>
        ) : (
          <EmptyState title="No items found" message="Try a different search or check back later." />
        )}
      </main>
    </div>
  );
}
