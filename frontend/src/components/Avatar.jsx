/** Displays a user avatar image, falling back to initials. */
export default function Avatar({ user, size = 'md' }) {
  const initials = (user?.fullName || user?.username || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const cls = `avatar ${size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : ''}`;

  if (user?.avatarUrl) {
    return (
      <div className={cls}>
        <img src={user.avatarUrl} alt={user.username} />
      </div>
    );
  }

  return <div className={cls}>{initials}</div>;
}
