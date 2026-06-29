import { Link } from 'react-router-dom';
import { Coins, Gift, PackageCheck } from 'lucide-react';

export default function ShopItemCard({ item, userPoints = 0 }) {
  const canAfford = userPoints >= item.pricePoints;
  const soldOut   = item.quantity <= 0;

  return (
    <Link to={`/shop/${item.id}`} className={`shop-card ${soldOut ? 'sold-out' : ''}`}>
      <div className="shop-card-icon">
        <Gift size={24} />
      </div>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <div className="shop-card-footer">
        <span className="price">
          <Coins size={14} />
          {item.pricePoints} XP
        </span>
        <span className={`stock-badge ${soldOut ? 'out' : ''}`}>
          <PackageCheck size={12} style={{ marginRight: 3 }} />
          {soldOut ? 'Sold out' : `${item.quantity} left`}
        </span>
      </div>
      {!soldOut && (
        <div style={{ fontSize: '0.75rem', color: canAfford ? 'var(--green)' : 'var(--danger)' }}>
          {canAfford ? '✓ You can afford this' : 'Not enough XP'}
        </div>
      )}
    </Link>
  );
}
