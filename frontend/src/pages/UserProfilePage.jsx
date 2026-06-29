import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BadgeCheck, Check, Coins, UserCheck, UserMinus, UserPlus, X, Zap } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import BadgeCard from '../components/BadgeCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Avatar from '../components/Avatar.jsx';
import PostCard from '../components/PostCard.jsx';
import UserListModal from '../components/UserListModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getProfile } from '../api/users.js';
import { getUserBadges } from '../api/badges.js';
import { getUserPosts } from '../api/posts.js';
import {
  getFriends, getSentRequests, getFriendshipStatus,
  sendRequest, removeFriendship, acceptFriendship,
} from '../api/friends.js';
import { follow, unfollow, followStatus, getFollowing, getFollowers } from '../api/follows.js';

/**
 * Public profile page for any user (/profile/:id).
 *
 * Relationship matrix:
 *   Viewer (USER)         → Target (USER)         : Friend Request / Friends
 *   Viewer (USER)         → Target (SHOP_MANAGER) : Follow / Unfollow
 *   Viewer (SHOP_MANAGER) → Target (any)          : read-only (no action)
 */
export default function UserProfilePage() {
  const { id }     = useParams();
  const { user, isShopManager: viewerIsShopManager } = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const targetId = Number(id);

  useEffect(() => {
    if (user && user.id === targetId) navigate('/profile', { replace: true });
  }, [user, targetId, navigate]);

  // ── Core data ──────────────────────────────────────────────────────────────
  const [profile,   setProfile]   = useState(null);
  const [badges,    setBadges]    = useState([]);
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  // ── Friendship state (profile-level action button) ─────────────────────────
  const [friendStatus,  setFriendStatus]  = useState('NONE');
  const [friendshipId,  setFriendshipId]  = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);

  // ── Follow state (profile-level action button) ────────────────────────────
  const [isFollowing,   setIsFollowing]   = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // ── Stats list modal ──────────────────────────────────────────────────────
  const [listModal,   setListModal]   = useState(null);
  const [listUsers,   setListUsers]   = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Viewer's relationships — loaded fresh whenever a list modal opens.
  // friendMap:  { userId → friendshipId }  for ACCEPTED friendships
  // sentMap:    { userId → friendshipId }  for SENT (pending) requests
  // followingSet: Set<userId>              shop managers the viewer follows
  const [friendMap,    setFriendMap]    = useState({});
  const [sentMap,      setSentMap]      = useState({});
  const [followingSet, setFollowingSet] = useState(new Set());
  const [actionBusy,   setActionBusy]   = useState(new Set());

  // ── Load profile + relationship status ───────────────────────────────────
  useEffect(() => {
    if (!targetId) return;
    setFriendStatus('NONE'); setFriendshipId(null); setIsFollowing(false);
    setProfile(null); setBadges([]); setPosts([]);
    setLoading(true);

    Promise.all([getProfile(targetId), getUserBadges(targetId), getUserPosts(targetId)])
      .then(([p, b, po]) => {
        setProfile(p); setBadges(b); setPosts(po);
        if (!user || viewerIsShopManager || user.id === targetId) return;
        if (p.accountType === 'SHOP_MANAGER') {
          followStatus(user.id, targetId)
            .then(res => setIsFollowing(res?.following ?? false))
            .catch(() => {});
        } else {
          getFriendshipStatus(user.id, targetId)
            .then(res => { setFriendStatus(res?.status ?? 'NONE'); setFriendshipId(res?.friendshipId ?? null); })
            .catch(() => {});
        }
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [targetId, user?.id, viewerIsShopManager]);

  // ── Friend actions (profile card) ─────────────────────────────────────────
  async function handleFriendAction() {
    if (friendLoading) return;
    setFriendLoading(true);
    try {
      if (friendStatus === 'NONE') {
        const res = await sendRequest(user.id, targetId);
        setFriendStatus('SENT'); setFriendshipId(res.id);
        toast('Friend request sent!');
      } else if (friendStatus === 'SENT') {
        await removeFriendship(friendshipId);
        setFriendStatus('NONE'); setFriendshipId(null);
        toast('Friend request cancelled.');
      } else if (friendStatus === 'RECEIVED') {
        const res = await acceptFriendship(friendshipId);
        setFriendStatus('ACCEPTED'); setFriendshipId(res.id);
        toast(`You and ${profile?.fullName} are now friends!`);
        setProfile(p => p ? { ...p, friendCount: (p.friendCount ?? 0) + 1 } : p);
      } else if (friendStatus === 'ACCEPTED') {
        await removeFriendship(friendshipId);
        setFriendStatus('NONE'); setFriendshipId(null);
        toast('Friend removed.');
        setProfile(p => p ? { ...p, friendCount: Math.max(0, (p.friendCount ?? 1) - 1) } : p);
      }
    } catch (err) { toast(err.message, 'error'); }
    finally { setFriendLoading(false); }
  }

  async function handleDecline() {
    if (friendLoading) return;
    setFriendLoading(true);
    try {
      await removeFriendship(friendshipId);
      setFriendStatus('NONE'); setFriendshipId(null);
      toast('Request declined.');
    } catch (err) { toast(err.message, 'error'); }
    finally { setFriendLoading(false); }
  }

  // ── Follow actions (profile card) ─────────────────────────────────────────
  async function handleFollowToggle() {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollow(user.id, targetId);
        setIsFollowing(false);
        setProfile(p => p ? { ...p, followersCount: Math.max(0, (p.followersCount ?? 1) - 1) } : p);
        toast('Unfollowed.');
      } else {
        await follow(user.id, targetId);
        setIsFollowing(true);
        setProfile(p => p ? { ...p, followersCount: (p.followersCount ?? 0) + 1 } : p);
        toast(`Following ${profile?.fullName}!`);
      }
    } catch (err) { toast(err.message, 'error'); }
    finally { setFollowLoading(false); }
  }

  // ── Open list modal + load viewer's own relationships ─────────────────────
  async function openList(type) {
    setListModal(type);
    setListLoading(true);
    setListUsers([]);
    setFriendMap({}); setSentMap({}); setFollowingSet(new Set());

    try {
      // Fetch the target's user list
      const listPromise = (async () => {
        if (type === 'friends') {
          const fs = await getFriends(targetId);
          return fs.map(f => f.otherUser).filter(Boolean);
        }
        if (type === 'following') return getFollowing(targetId);
        if (type === 'followers') return getFollowers(targetId);
        return [];
      })();

      // Fetch viewer's own relationships in parallel (only for regular users)
      const canAct = !viewerIsShopManager && !!user;
      const [data, vFriends, vSent, vFollowing] = await Promise.all([
        listPromise,
        canAct ? getFriends(user.id)      : Promise.resolve([]),
        canAct ? getSentRequests(user.id)  : Promise.resolve([]),
        canAct ? getFollowing(user.id)     : Promise.resolve([]),
      ]);

      setListUsers(data);

      // Build lookup maps
      const fm = {};
      for (const fs of vFriends)  { if (fs.otherUser) fm[fs.otherUser.id] = fs.id; }
      setFriendMap(fm);

      const sm = {};
      for (const fs of vSent)     { if (fs.otherUser) sm[fs.otherUser.id] = fs.id; }
      setSentMap(sm);

      setFollowingSet(new Set(vFollowing.map(u => u.id)));
    } catch (err) {
      toast(err.message, 'error');
      setListModal(null);
    } finally {
      setListLoading(false);
    }
  }

  // ── Per-user action renderer (passed to UserListModal) ────────────────────
  function renderListAction(listedUser) {
    // Shop manager viewers have no social actions
    if (viewerIsShopManager || !user) return null;
    // No button for yourself
    if (listedUser.id === user.id) return null;

    const busy = actionBusy.has(listedUser.id);

    function setBusy(val) {
      setActionBusy(prev => {
        const n = new Set(prev);
        val ? n.add(listedUser.id) : n.delete(listedUser.id);
        return n;
      });
    }

    async function run(fn) {
      if (busy) return;
      setBusy(true);
      try {
        await fn();
      } catch (err) {
        toast(err.message || 'Something went wrong', 'error');
      } finally {
        setBusy(false);
      }
    }

    // ── User → Shop Manager : Follow / Unfollow ──────────────────────────────
    if (listedUser.accountType === 'SHOP_MANAGER') {
      const isFollowed = followingSet.has(listedUser.id);
      return (
        <button
          className={`btn btn-sm ${isFollowed ? 'btn-ghost' : 'btn-primary'}`}
          style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}
          disabled={busy}
          onClick={e => {
            e.preventDefault(); e.stopPropagation();
            run(async () => {
              if (isFollowed) {
                await unfollow(user.id, listedUser.id);
                setFollowingSet(prev => { const n = new Set(prev); n.delete(listedUser.id); return n; });
                toast('Unfollowed.');
              } else {
                await follow(user.id, listedUser.id);
                setFollowingSet(prev => new Set(prev).add(listedUser.id));
                toast(`Following ${listedUser.fullName || listedUser.username}!`);
              }
            });
          }}
        >
          {busy ? '…' : isFollowed
            ? <><UserMinus size={12} /> Unfollow</>
            : <><UserPlus  size={12} /> Follow</>}
        </button>
      );
    }

    // ── User → User : Friend actions ──────────────────────────────────────────
    const acceptedFsId = friendMap[listedUser.id];
    const sentFsId     = sentMap[listedUser.id];

    if (acceptedFsId !== undefined) {
      // Already friends → Unfriend
      return (
        <button
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}
          disabled={busy}
          onClick={e => {
            e.preventDefault(); e.stopPropagation();
            run(async () => {
              await removeFriendship(acceptedFsId);
              setFriendMap(prev => { const n = { ...prev }; delete n[listedUser.id]; return n; });
              toast('Friend removed.');
            });
          }}
        >
          {busy ? '…' : <><UserCheck size={12} /> Friends</>}
        </button>
      );
    }

    if (sentFsId !== undefined) {
      // Request already sent → Cancel
      return (
        <button
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}
          disabled={busy}
          onClick={e => {
            e.preventDefault(); e.stopPropagation();
            run(async () => {
              await removeFriendship(sentFsId);
              setSentMap(prev => { const n = { ...prev }; delete n[listedUser.id]; return n; });
              toast('Friend request cancelled.');
            });
          }}
        >
          {busy ? '…' : <><Check size={12} /> Requested</>}
        </button>
      );
    }

    // Not friends, no pending request → Add Friend
    return (
      <button
        className="btn btn-primary btn-sm"
        style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}
        disabled={busy}
        onClick={e => {
          e.preventDefault(); e.stopPropagation();
          run(async () => {
            const res = await sendRequest(user.id, listedUser.id);
            setSentMap(prev => ({ ...prev, [listedUser.id]: res.id }));
            toast('Friend request sent!');
          });
        }}
      >
        {busy ? '…' : <><UserPlus size={12} /> Add Friend</>}
      </button>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="app-layout"><Navbar /><main className="page-content"><LoadingSpinner /></main></div>
  );
  if (!profile) return (
    <div className="app-layout"><Navbar /><main className="page-content"><EmptyState title="User not found" /></main></div>
  );

  const targetIsShopManager = profile.accountType === 'SHOP_MANAGER';
  const targetIsVerified    = profile.verificationStatus === 'VERIFIED';
  const viewerIsRegularUser = !viewerIsShopManager;

  const friendConfigs = {
    NONE:     { label: 'Add Friend',     icon: <UserPlus size={14} />,  cls: 'btn-ghost'     },
    SENT:     { label: 'Requested',      icon: <Check size={14} />,     cls: 'btn-requested' },
    RECEIVED: { label: 'Accept Request', icon: <UserCheck size={14} />, cls: 'btn-primary'   },
    ACCEPTED: { label: 'Friends',        icon: <UserCheck size={14} />, cls: 'btn-friends'   },
  };
  const friendCfg = friendConfigs[friendStatus] ?? friendConfigs.NONE;

  const tabs = [
    { id: 'posts',  label: `Posts (${posts.length})` },
    ...(!targetIsShopManager ? [{ id: 'badges', label: `Badges (${badges.length})` }] : []),
  ];

  const stats = targetIsShopManager
    ? [
        { label: 'Posts',     value: profile.postCount      ?? posts.length, onClick: null },
        { label: 'Followers', value: profile.followersCount ?? 0,            onClick: () => openList('followers') },
      ]
    : [
        { label: 'Posts',     value: profile.postCount     ?? posts.length, onClick: null },
        { label: 'Friends',   value: profile.friendCount   ?? 0,            onClick: () => openList('friends') },
        { label: 'Following', value: profile.followingCount ?? 0,           onClick: () => openList('following') },
      ];

  const listTitles = { friends: 'Friends', following: 'Following', followers: 'Followers' };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="profile-layout">

          {/* ── Left: identity card ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="panel profile-card">
              <Avatar user={profile} size="lg" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                <strong style={{ fontSize: '1rem' }}>{profile.fullName}</strong>
                {targetIsShopManager && targetIsVerified && (
                  <BadgeCheck size={16} style={{ color: '#3b82f6' }} title="Verified Shop Manager" />
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>@{profile.username}</span>

              {targetIsShopManager && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: 99, marginTop: '0.1rem',
                  background: targetIsVerified ? 'rgba(59,130,246,0.1)' : 'rgba(255,202,85,0.1)',
                  color:      targetIsVerified ? '#3b82f6'               : 'var(--gold)',
                  border:     `1px solid ${targetIsVerified ? 'rgba(59,130,246,0.3)' : 'rgba(255,202,85,0.3)'}`,
                }}>
                  {targetIsVerified ? 'Shop Manager' : 'Pending Shop Manager'}
                </span>
              )}

              {profile.bio && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, textAlign: 'center', margin: '0.25rem 0', padding: '0 0.25rem' }}>
                  {profile.bio}
                </p>
              )}

              {!targetIsShopManager && (
                <>
                  <div className="xp-chip gold"><Coins size={12} /> {profile.currentPoints} XP</div>
                  <div className="xp-chip green" style={{ marginTop: '0.25rem' }}>
                    <Zap size={12} /> {profile.totalEarnedPoints} total XP
                  </div>
                </>
              )}

              {/* Action button — enforces relationship matrix */}
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                {targetIsShopManager ? (
                  viewerIsRegularUser && targetIsVerified && (
                    <button
                      className={`btn btn-sm ${isFollowing ? 'btn-friends' : 'btn-ghost'}`}
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                    >
                      {isFollowing
                        ? <><UserMinus size={14} /> {followLoading ? '…' : 'Following'}</>
                        : <><UserPlus  size={14} /> {followLoading ? '…' : 'Follow'}</>}
                    </button>
                  )
                ) : (
                  viewerIsRegularUser && (
                    <>
                      <button
                        className={`btn ${friendCfg.cls} btn-sm`}
                        onClick={handleFriendAction}
                        disabled={friendLoading}
                        title={
                          friendStatus === 'SENT'     ? 'Click to cancel request' :
                          friendStatus === 'ACCEPTED' ? 'Click to remove friend'  : undefined
                        }
                      >
                        {friendCfg.icon} {friendLoading ? '…' : friendCfg.label}
                      </button>
                      {friendStatus === 'RECEIVED' && (
                        <button className="btn btn-ghost btn-sm" onClick={handleDecline} disabled={friendLoading}>
                          <X size={13} /> Decline
                        </button>
                      )}
                    </>
                  )
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="stats-row">
              {stats.map(({ label, value, onClick }) => (
                <div
                  key={label}
                  className="stat-box"
                  onClick={onClick ?? undefined}
                  style={onClick ? { cursor: 'pointer' } : undefined}
                  title={onClick ? `View ${label.toLowerCase()}` : undefined}
                >
                  <div className="value">{value}</div>
                  <div className="label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: tabs ── */}
          <div>
            <div className="flex-center gap-sm mb-md">
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

            {activeTab === 'posts' && (
              posts.length > 0
                ? <div className="feed-list">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>
                : <EmptyState title="No posts yet" message="This user hasn't shared anything yet." />
            )}

            {activeTab === 'badges' && (
              badges.length > 0
                ? <div className="badge-grid">{badges.map(ub => <BadgeCard key={ub.id} badge={ub.badge} earnedAt={ub.earnedAt} />)}</div>
                : <EmptyState title="No badges yet" />
            )}
          </div>
        </div>
      </main>

      {listModal && (
        <UserListModal
          title={listTitles[listModal]}
          users={listUsers}
          loading={listLoading}
          onClose={() => setListModal(null)}
          renderAction={renderListAction}
        />
      )}
    </div>
  );
}
