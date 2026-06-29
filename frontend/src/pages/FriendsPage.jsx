import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Check, Search, UserCheck, UserMinus, UserPlus, X } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  getFriends, getPendingRequests, getSentRequests,
  sendRequest, acceptFriendship, removeFriendship,
} from '../api/friends.js';
import { follow, unfollow, getFollowing } from '../api/follows.js';
import { getUsers } from '../api/users.js';

// ── Friendship button (User ↔ User only) ─────────────────────────────────────

function FriendActionButton({ targetUser, currentUserId, initialStatus, initialFriendshipId, onStatusChange }) {
  const { toast } = useToast();
  const [status,       setStatus]       = useState(initialStatus      ?? 'NONE');
  const [friendshipId, setFriendshipId] = useState(initialFriendshipId ?? null);
  const [loading,      setLoading]      = useState(false);

  async function handle() {
    if (loading) return;
    setLoading(true);
    try {
      if (status === 'NONE') {
        const res = await sendRequest(currentUserId, targetUser.id);
        setStatus('SENT'); setFriendshipId(res.id);
        toast('Friend request sent!');
        onStatusChange?.('SENT', res.id);
      } else if (status === 'SENT') {
        await removeFriendship(friendshipId);
        setStatus('NONE'); setFriendshipId(null);
        toast('Friend request cancelled.');
        onStatusChange?.('NONE', null);
      } else if (status === 'RECEIVED') {
        const res = await acceptFriendship(friendshipId);
        setStatus('ACCEPTED'); setFriendshipId(res.id);
        toast(`You and ${targetUser.fullName || targetUser.username} are now friends!`);
        onStatusChange?.('ACCEPTED', res.id);
      } else if (status === 'ACCEPTED') {
        await removeFriendship(friendshipId);
        setStatus('NONE'); setFriendshipId(null);
        toast('Friend removed.');
        onStatusChange?.('NONE', null);
      }
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  async function handleDecline() {
    if (loading) return;
    setLoading(true);
    try {
      await removeFriendship(friendshipId);
      setStatus('NONE'); setFriendshipId(null);
      toast('Request declined.');
      onStatusChange?.('NONE', null);
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  const configs = {
    NONE:     { label: 'Add Friend', icon: null, cls: 'btn-ghost'     },
    SENT:     { label: 'Requested',  icon: null, cls: 'btn-requested' },
    RECEIVED: { label: 'Accept',     icon: null, cls: 'btn-primary'   },
    ACCEPTED: { label: 'Friends',    icon: null, cls: 'btn-friends'   },
  };
  const cfg = configs[status] || configs.NONE;

  return (
    <div className="flex-center gap-sm">
      <button
        className={`btn ${cfg.cls} btn-sm`}
        onClick={handle}
        disabled={loading}
        title={status === 'SENT' ? 'Click to cancel' : status === 'ACCEPTED' ? 'Click to remove' : undefined}
      >
        {loading ? '...' : cfg.label}
      </button>
      {status === 'RECEIVED' && (
        <button className="btn btn-ghost btn-sm" onClick={handleDecline} disabled={loading}>
          Decline
        </button>
      )}
    </div>
  );
}

// ── Follow button (User → Shop Manager only) ──────────────────────────────────

function FollowButton({ currentUserId, targetUser, initialFollowing, onToggle }) {
  const { toast } = useToast();
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loading,   setLoading]   = useState(false);

  async function handle() {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await unfollow(currentUserId, targetUser.id);
        setFollowing(false);
        toast('Unfollowed.');
        onToggle?.(false);
      } else {
        await follow(currentUserId, targetUser.id);
        setFollowing(true);
        toast('Following ' + (targetUser.fullName || targetUser.username) + '!');
        onToggle?.(true);
      }
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <button
      className={'btn btn-sm ' + (following ? 'btn-friends' : 'btn-ghost')}
      onClick={handle}
      disabled={loading}
      title={following ? 'Click to unfollow' : undefined}
    >
      {loading ? '...' : following ? 'Following' : 'Follow'}
    </button>
  );
}

// ── Shared search bar ────────────────────────────────────────────────────────

function SearchBar({ query, setQuery }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'var(--input-bg, rgba(255,255,255,0.06))',
        border: '1px solid var(--panel-border)',
        borderRadius: 'var(--radius)',
        padding: '0.5rem 0.85rem',
        marginBottom: '1rem',
        maxWidth: 400,
        transition: 'border-color 0.15s',
      }}
      onFocusCapture={function(e) { e.currentTarget.style.borderColor = 'var(--accent, #6366f1)'; }}
      onBlurCapture={function(e) { e.currentTarget.style.borderColor = 'var(--panel-border)'; }}
    >
      <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
      <input
        value={query}
        onChange={function(e) { setQuery(e.target.value); }}
        placeholder="Search…"
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--text)', fontSize: '0.85rem', flex: 1, minWidth: 0,
        }}
      />
      {query && (
        <button
          onClick={function() { setQuery(''); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const { user, isShopManager } = useAuth();
  const { toast }               = useToast();
  const navigate                = useNavigate();

  useEffect(() => {
    if (isShopManager) navigate('/profile', { replace: true });
  }, [isShopManager]);

  const [friends,      setFriends]      = useState([]);
  const [pending,      setPending]      = useState([]);
  const [following,    setFollowing]    = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [allUsers,     setAllUsers]     = useState([]);
  const [statusMap,    setStatusMap]    = useState({});
  const [query,        setQuery]        = useState('');
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('friends');

  function switchTab(tab) { setActiveTab(tab); setQuery(''); }

  useEffect(() => {
    if (user && user.id && !isShopManager) load();
  }, [user && user.id]);

  async function load() {
    setLoading(true);
    try {
      const results = await Promise.all([
        getFriends(user.id),
        getPendingRequests(user.id),
        getSentRequests(user.id),
        getUsers(),
        getFollowing(user.id),
      ]);
      const f           = results[0];
      const p           = results[1];
      const sent        = results[2];
      const all         = results[3];
      const followingList = results[4];

      setFriends(f);
      setPending(p);
      setFollowing(followingList || []);
      setFollowingIds(new Set((followingList || []).map(function(u) { return u.id; })));
      setAllUsers((all || []).filter(function(u) { return u.id !== user.id; }));

      var map = {};
      f.forEach(function(fs) {
        var oid = fs.otherUser && fs.otherUser.id;
        if (oid) map[oid] = { status: 'ACCEPTED', friendshipId: fs.id };
      });
      p.forEach(function(fs) {
        var oid = fs.otherUser && fs.otherUser.id;
        if (oid) map[oid] = { status: 'RECEIVED', friendshipId: fs.id };
      });
      (sent || []).forEach(function(fs) {
        var oid = fs.otherUser && fs.otherUser.id;
        if (oid && !map[oid]) map[oid] = { status: 'SENT', friendshipId: fs.id };
      });
      setStatusMap(map);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleFriendStatusChange(targetUser, newStatus, newFriendshipId) {
    setStatusMap(function(prev) {
      var next = Object.assign({}, prev);
      if (newStatus === 'NONE') {
        delete next[targetUser.id];
      } else {
        next[targetUser.id] = { status: newStatus, friendshipId: newFriendshipId };
      }
      return next;
    });
    if (newStatus === 'ACCEPTED') {
      setFriends(function(prev) { return [...prev, { id: newFriendshipId, otherUser: targetUser }]; });
      setPending(function(prev) { return prev.filter(function(p) { return p.otherUser && p.otherUser.id !== targetUser.id; }); });
    } else if (newStatus === 'NONE') {
      setFriends(function(prev) { return prev.filter(function(f) { return f.otherUser && f.otherUser.id !== targetUser.id; }); });
      setPending(function(prev) { return prev.filter(function(p) { return p.otherUser && p.otherUser.id !== targetUser.id; }); });
    }
  }

  function handleFollowToggle(targetUser, nowFollowing) {
    setFollowingIds(function(prev) {
      var next = new Set(prev);
      if (nowFollowing) { next.add(targetUser.id); } else { next.delete(targetUser.id); }
      return next;
    });
    setFollowing(function(prev) {
      return nowFollowing
        ? [...prev, targetUser]
        : prev.filter(function(u) { return u.id !== targetUser.id; });
    });
  }

  async function handleUnfollowInTab(sm) {
    try {
      await unfollow(user.id, sm.id);
      handleFollowToggle(sm, false);
      toast('Unfollowed.');
    } catch (err) { toast(err.message, 'error'); }
  }

  var q = query.trim().toLowerCase();

  var filteredFriends = q
    ? friends.filter(function(f) {
        var u = f.otherUser;
        return u && ((u.fullName || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q));
      })
    : friends;

  var filteredFollowing = q
    ? following.filter(function(sm) {
        return (sm.fullName || '').toLowerCase().includes(q) || (sm.username || '').toLowerCase().includes(q);
      })
    : following;

  var suggestedUsers = allUsers.filter(function(u) {
    return !statusMap[u.id] || statusMap[u.id].status !== 'ACCEPTED';
  });
  var filteredSuggested = q
    ? suggestedUsers.filter(function(u) {
        return (u.username || '').toLowerCase().includes(q) ||
               (u.fullName  || '').toLowerCase().includes(q);
      })
    : suggestedUsers;

  var tabs = [
    { id: 'friends',   label: 'Friends (' + friends.length + ')' },
    { id: 'following', label: 'Following (' + following.length + ')' },
    { id: 'suggested', label: 'Find People' },
  ];
  if (pending.length > 0) {
    tabs.push({ id: 'requests', label: 'Requests (' + pending.length + ')' });
  }

  if (isShopManager) return null;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <span className="eyebrow">Your network</span>
          <h1>Friends &amp; Following</h1>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div>
            <div className="flex-center gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
              {tabs.map(function(t) {
                return (
                  <button
                    key={t.id}
                    className={'btn ' + (activeTab === t.id ? 'btn-primary' : 'btn-ghost') + ' btn-sm'}
                    onClick={function() { switchTab(t.id); }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'friends' && (
              <div>
                <SearchBar query={query} setQuery={setQuery} />
                {filteredFriends.length > 0 ? (
                  <div className="friends-list">
                    {filteredFriends.map(function(f) {
                      var u = f.otherUser;
                      if (!u) return null;
                      return (
                        <div key={f.id} className="friend-row">
                          <Link to={'/profile/' + u.id} style={{ textDecoration: 'none', flexShrink: 0 }}>
                            <Avatar user={u} size="sm" />
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link to={'/profile/' + u.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.fullName || u.username}</div>
                            </Link>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>@{u.username}</div>
                          </div>
                          <FriendActionButton
                            targetUser={u}
                            currentUserId={user.id}
                            initialStatus="ACCEPTED"
                            initialFriendshipId={f.id}
                            onStatusChange={function(s, fid) { handleFriendStatusChange(u, s, fid); }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : friends.length === 0 ? (
                  <EmptyState
                    title="No friends yet"
                    message="Go to Find People to connect with other students."
                    action={{ label: 'Find People', onClick: function() { switchTab('suggested'); } }}
                  />
                ) : (
                  <EmptyState title="No results" message={'No friends match "' + query + '".'} />
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div>
                <SearchBar query={query} setQuery={setQuery} />
                {filteredFollowing.length > 0 ? (
                  <div className="friends-list">
                    {filteredFollowing.map(function(sm) {
                      return (
                        <div key={sm.id} className="friend-row">
                          <Link to={'/profile/' + sm.id} style={{ textDecoration: 'none', flexShrink: 0 }}>
                            <Avatar user={sm} size="sm" />
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link to={'/profile/' + sm.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {sm.fullName || sm.username}
                                {sm.verificationStatus === 'VERIFIED' && (
                                  <BadgeCheck size={13} style={{ color: '#3b82f6' }} />
                                )}
                              </div>
                            </Link>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>@{sm.username} &middot; Shop Manager</div>
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={function() { handleUnfollowInTab(sm); }}
                          >
                            Unfollow
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : following.length === 0 ? (
                  <EmptyState title="Not following anyone yet" message="Visit a shop manager's profile to follow them." />
                ) : (
                  <EmptyState title="No results" message={'No shop managers match "' + query + '".'} />
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              pending.length > 0 ? (
                <div className="friends-list">
                  {pending.map(function(p) {
                    var u = p.otherUser;
                    if (!u) return null;
                    return (
                      <div key={p.id} className="friend-row">
                        <Link to={'/profile/' + u.id} style={{ textDecoration: 'none', flexShrink: 0 }}>
                          <Avatar user={u} size="sm" />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={'/profile/' + u.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.fullName || u.username}</div>
                          </Link>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>@{u.username}</div>
                        </div>
                        <FriendActionButton
                          targetUser={u}
                          currentUserId={user.id}
                          initialStatus="RECEIVED"
                          initialFriendshipId={p.id}
                          onStatusChange={function(s, fid) { handleFriendStatusChange(u, s, fid); }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : <EmptyState title="No pending requests" />
            )}

            {activeTab === 'suggested' && (
              <div>
                <SearchBar query={query} setQuery={setQuery} />

                {filteredSuggested.length > 0 ? (
                  <div className="friends-list">
                    {filteredSuggested.map(function(u) {
                      var isTargetShopManager = u.accountType === 'SHOP_MANAGER';
                      var isTargetVerified    = u.verificationStatus === 'VERIFIED';
                      var info = statusMap[u.id];

                      return (
                        <div key={u.id} className="friend-row">
                          <Link to={'/profile/' + u.id} style={{ textDecoration: 'none', flexShrink: 0 }}>
                            <Avatar user={u} size="sm" />
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link to={'/profile/' + u.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {u.fullName || u.username}
                                {isTargetShopManager && isTargetVerified && (
                                  <BadgeCheck size={13} style={{ color: '#3b82f6' }} />
                                )}
                              </div>
                            </Link>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                              @{u.username}{isTargetShopManager ? ' · Shop Manager' : ' · ' + (u.currentPoints || 0) + ' XP'}
                            </div>
                          </div>

                          {isTargetShopManager ? (
                            isTargetVerified ? (
                              <FollowButton
                                currentUserId={user.id}
                                targetUser={u}
                                initialFollowing={followingIds.has(u.id)}
                                onToggle={function(nowFollowing) { handleFollowToggle(u, nowFollowing); }}
                              />
                            ) : null
                          ) : (
                            <FriendActionButton
                              targetUser={u}
                              currentUserId={user.id}
                              initialStatus={(info && info.status) || 'NONE'}
                              initialFriendshipId={(info && info.friendshipId) || null}
                              onStatusChange={function(s, fid) { handleFriendStatusChange(u, s, fid); }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title={q ? 'No results' : 'No users found'} />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
