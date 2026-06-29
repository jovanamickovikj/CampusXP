import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Gift, PackageCheck } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getShopItem, purchase } from '../api/shop.js';
import { getProfile } from '../api/users.js';

export default function ShopItemPage() {
  const { id }      = useParams();
  const { user, isPrivileged } = useAuth();
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const [item, setItem]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([getShopItem(id), getProfile(user.id)])
      .then(([i, p]) => { setItem(i); setProfile(p); })
      .finally(() => setLoading(false));
  }, [id, user.id]);

  async function handlePurchase() {
    setBuying(true);
    setError('');
    try {
      await purchase(user.id, item.id);
      setSuccess(true);
      toast(`Purchased ${item.name}! Check your inventory.`);
      // refresh profile points
      const updated = await getProfile(user.id);
      setProfile(updated);
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <div className="app-layout"><Navbar /><main className="page-content"><LoadingSpinner /></main></div>;

  const canAfford = (profile?.currentPoints ?? 0) >= item.pricePoints;
  const soldOut   = item.quantity <= 0;

  return (
    <div className="app-layout">
      <Navbar points={profile?.currentPoints} />
      <main className="page-content" style={{ maxWidth: 600 }}>
        <button className="btn btn-ghost btn-sm mb-md" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to shop
        </button>

        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex-center gap-md">
            <div className="shop-card-icon" style={{ width: 72, height: 72, borderRadius: 'var(--radius)' }}>
              <Gift size={34} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.name}</h2>
              <div className={`stock-badge ${soldOut ? 'out' : ''}`} style={{ marginTop: '0.25rem' }}>
                <PackageCheck size={12} style={{ marginRight: 4 }} />
                {soldOut ? 'Sold out' : `${item.quantity} remaining`}
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{item.description}</p>

          <div className="divider" />

          <div className="flex-center gap-md">
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Price</div>
              <div className="price" style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>
                <Coins size={18} /> {item.pricePoints} XP
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your XP</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.2rem', color: canAfford ? 'var(--green)' : 'var(--danger)' }}>
                {profile?.currentPoints ?? 0}
              </div>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {isPrivileged ? (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(100,116,139,0.08)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--muted)' }}>
              Shop managers and admins cannot purchase items.
            </div>
          ) : success ? (
            <div style={{ background: 'var(--green-soft)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', color: 'var(--green)', fontWeight: 600 }}>
              Purchase successful! Check your inventory.
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handlePurchase}
              disabled={soldOut || !canAfford || buying}
            >
              <Coins size={16} />
              {buying ? 'Processing…' : soldOut ? 'Sold out' : !canAfford ? 'Not enough XP' : 'Purchase now'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
