import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Coins, QrCode, ShoppingBag, X, Zap } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getInventory, getUsedHistory, useItem } from '../api/shop.js';

/** Modal showing a QR code for the item, then confirming use. */
function UseItemModal({ purchase, onConfirm, onClose }) {
  const [confirming, setConfirming] = useState(false);

  // QR code encodes a unique scan payload for the item
  const qrData = encodeURIComponent(
    `CAMPUSXP:ITEM:${purchase.shopItem.id}:PURCHASE:${purchase.id}:USER:${purchase.user?.id ?? ''}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&color=ff087f&bgcolor=0d0f1a`;

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" style={{ maxWidth: 380, textAlign: 'center', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', padding: '0.25rem',
          }}
        >
          <X size={16} />
        </button>

        <QrCode size={28} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
        <h2 style={{ marginBottom: '0.25rem' }}>{purchase.shopItem.name}</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Show this QR code at the redemption point. Once scanned, the item will be marked as used and cannot be redeemed again.
        </p>

        <img
          src={qrUrl}
          alt="Item QR code"
          width={180}
          height={180}
          style={{
            borderRadius: 'var(--radius)',
            border: '2px solid var(--panel-border)',
            imageRendering: 'pixelated',
            marginBottom: '1.25rem',
          }}
        />

        <div style={{
          background: 'rgba(255,8,127,0.07)',
          border: '1px solid rgba(255,8,127,0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.65rem 1rem',
          fontSize: '0.78rem',
          color: 'var(--muted)',
          marginBottom: '1.25rem',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
        }}>
          PURCHASE #{purchase.id} · {new Date(purchase.purchasedAt).toLocaleDateString()}
        </div>

        <div className="flex-center gap-sm" style={{ justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            disabled={confirming}
            onClick={async () => {
              setConfirming(true);
              await onConfirm();
            }}
          >
            <CheckCircle2 size={15} />
            {confirming ? 'Redeeming…' : 'Confirm Redemption'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function InventoryCard({ purchase, onUse }) {
  const item = purchase.shopItem;

  return (
    <div className="inventory-card" style={{ position: 'relative' }}>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          style={{
            width: '100%',
            height: 140,
            objectFit: 'cover',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.75rem',
            border: '1px solid var(--panel-border)',
          }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div style={{
          width: '100%', height: 100,
          background: 'rgba(255,8,127,0.06)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.75rem',
          border: '1px solid var(--panel-border)',
        }}>
          <ShoppingBag size={32} style={{ color: 'var(--accent)', opacity: 0.4 }} />
        </div>
      )}

      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.25rem' }}>{item.name}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
        {item.description}
      </p>

      <div className="divider" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600 }}>
          <Coins size={12} /> {purchase.pointsPaid} XP
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
          {new Date(purchase.purchasedAt).toLocaleDateString()}
        </span>
      </div>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: '0.72rem', fontWeight: 700,
        color: 'var(--green)',
        background: 'rgba(41,238,114,0.08)',
        border: '1px solid rgba(41,238,114,0.2)',
        borderRadius: 999, padding: '0.2rem 0.6rem',
        marginBottom: '0.75rem',
      }}>
        ● Unused
      </span>

      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => onUse(purchase)}>
        <QrCode size={13} /> Scan / Use Item
      </button>
    </div>
  );
}

function UsedCard({ purchase }) {
  const item = purchase.shopItem;

  return (
    <div className="inventory-card" style={{ opacity: 0.7 }}>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          style={{
            width: '100%', height: 140, objectFit: 'cover',
            borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem',
            border: '1px solid var(--panel-border)', filter: 'grayscale(40%)',
          }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div style={{
          width: '100%', height: 100,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.75rem',
          border: '1px solid var(--panel-border)',
        }}>
          <ShoppingBag size={32} style={{ opacity: 0.2 }} />
        </div>
      )}

      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.25rem' }}>{item.name}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
        {item.description}
      </p>

      <div className="divider" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
          Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
        </span>
      </div>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: '0.72rem', fontWeight: 700,
        color: 'var(--muted)',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--panel-border)',
        borderRadius: 999, padding: '0.2rem 0.6rem',
      }}>
        <CheckCircle2 size={11} /> Used {purchase.usedAt ? `on ${new Date(purchase.usedAt).toLocaleDateString()}` : ''}
      </span>
    </div>
  );
}

export default function InventoryPage() {
  const { user }   = useAuth();
  const { toast }  = useToast();
  const [unused,   setUnused]   = useState([]);
  const [used,     setUsed]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('unused');
  const [scanning, setScanning] = useState(null); // purchase being scanned

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      getInventory(user.id),
      getUsedHistory(user.id),
    ]).then(([u, h]) => {
      setUnused(u);
      setUsed(h);
    }).catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function handleConfirmUse() {
    if (!scanning) return;
    try {
      const updated = await useItem(scanning.id);
      setUnused(prev => prev.filter(p => p.id !== scanning.id));
      setUsed(prev => [updated, ...prev]);
      toast(`"${scanning.shopItem.name}" redeemed successfully!`);
      setScanning(null);
    } catch (err) {
      toast(err.message, 'error');
      setScanning(null);
    }
  }

  const tabs = [
    { id: 'unused', label: `Inventory (${unused.length})` },
    { id: 'used',   label: `Redeemed (${used.length})` },
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <span className="eyebrow">Your rewards</span>
          <h1>Inventory</h1>
          <p>Manage and redeem your purchased items</p>
        </div>

        <div className="flex-center gap-sm mb-md" style={{ justifyContent: 'space-between' }}>
          <div className="flex-center gap-sm">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Link to="/shop" className="btn btn-ghost btn-sm">
            <ShoppingBag size={13} /> Visit Shop
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {activeTab === 'unused' && (
              unused.length > 0 ? (
                <div className="inventory-grid">
                  {unused.map(p => (
                    <InventoryCard key={p.id} purchase={p} onUse={setScanning} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing in your inventory"
                  message="Purchase items from the XP Shop and they'll appear here."
                  action={{ label: 'Go to Shop', href: '/shop' }}
                />
              )
            )}

            {activeTab === 'used' && (
              used.length > 0 ? (
                <div className="inventory-grid">
                  {used.map(p => <UsedCard key={p.id} purchase={p} />)}
                </div>
              ) : (
                <EmptyState title="No redeemed items yet" message="Scan an item from your inventory to redeem it." />
              )
            )}
          </>
        )}
      </main>

      {scanning && (
        <UseItemModal
          purchase={scanning}
          onConfirm={handleConfirmUse}
          onClose={() => setScanning(null)}
        />
      )}
    </div>
  );
}
