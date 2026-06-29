import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '4rem', color: 'var(--accent)' }}>404</h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>This page does not exist.</p>
      <Link to="/dashboard" className="btn btn-primary">
        <Home size={16} /> Go home
      </Link>
    </div>
  );
}
