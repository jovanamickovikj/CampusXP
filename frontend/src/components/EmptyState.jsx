import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * action: can be JSX, or { label, onClick } / { label, href }
 */
export default function EmptyState({ title = 'Nothing here yet', message = '', action = null }) {
  let actionNode = null;
  if (action) {
    if (typeof action === 'object' && !action.type) {
      // Plain object shorthand
      if (action.href) {
        actionNode = <Link to={action.href} className="btn btn-ghost btn-sm">{action.label}</Link>;
      } else if (action.onClick) {
        actionNode = <button className="btn btn-ghost btn-sm" onClick={action.onClick}>{action.label}</button>;
      }
    } else {
      actionNode = action; // JSX passthrough
    }
  }

  return (
    <div className="empty-state">
      <Inbox size={36} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionNode && <div style={{ marginTop: '0.75rem' }}>{actionNode}</div>}
    </div>
  );
}
