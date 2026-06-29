import { useEffect, useRef, useState } from 'react';
import { Archive, BadgeCheck, Coins, Edit2, FileText, Image, PenLine, Plus, Video, X, Zap } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import BadgeCard from '../components/BadgeCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Avatar from '../components/Avatar.jsx';
import EditProfileModal from '../components/EditProfileModal.jsx';
import PostCard from '../components/PostCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getProfile, getPointHistory } from '../api/users.js';
import { getUserBadges } from '../api/badges.js';
import { getUserPosts, getArchivedPosts, createPost, updatePost, archivePost, unarchivePost } from '../api/posts.js';
import { uploadFile } from '../api/upload.js';
import { follow, unfollow, getFollowing, getFollowers } from '../api/follows.js';
import { getFriends, removeFriendship } from '../api/friends.js';
import UserListModal from '../components/UserListModal.jsx';

// ── Post types ────────────────────────────────────────────────────────────────
const POST_TYPES = [
  { value: 'TEXT',     label: 'Text',     icon: PenLine,  accept: null },
  { value: 'IMAGE',    label: 'Image',    icon: Image,    accept: 'image/jpeg,image/png,image/gif,image/webp' },
  { value: 'DOCUMENT', label: 'Document', icon: FileText, accept: 'application/pdf' },
  { value: 'VIDEO',    label: 'Video',    icon: Video,    accept: 'video/mp4,video/webm,video/ogg' },
];

// ── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({ userId, onClose, onCreated }) {
  const [postType,     setPostType]     = useState('TEXT');
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [error,        setError]        = useState('');
  const fileInputRef = useRef(null);

  const selectedType = POST_TYPES.find(t => t.value === postType);
  const TypeIcon     = selectedType.icon;

  function switchType(type) {
    setPostType(type);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError('File too large. Max 50 MB.'); e.target.value = ''; return; }
    setError('');
    setSelectedFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (selectedType.accept && !selectedFile) { setError(`Please select a ${selectedType.label.toLowerCase()} file.`); return; }
    setUploading(true); setError('');
    try {
      let fileUrl = null;
      if (selectedFile) { const r = await uploadFile(selectedFile); fileUrl = r.url; }
      const post = await createPost({ userId, title: title.trim(), description: description.trim() || null, fileUrl, postType });
      onCreated(post);
    } catch (err) { setError(err.message); setUploading(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-pixel)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} style={{ color: 'var(--accent)' }} /> New Post
            </h2>
            <p style={{ margin: '0.15rem 0 0', color: 'var(--muted)', fontSize: '0.76rem' }}>Share something with your community</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={uploading} style={{ padding: '0.3rem' }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Type selector */}
            <div className="form-group">
              <label>Post Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                {POST_TYPES.map(({ value, label, icon: Icon }) => {
                  const active = postType === value;
                  return (
                    <button
                      key={value} type="button" onClick={() => switchType(value)}
                      style={{
                        padding: '0.6rem 0.85rem',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--panel-border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.15s', textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                        background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={13} style={{ color: active ? 'var(--accent)' : 'var(--muted)' }} />
                      </div>
                      <span style={{ fontSize: '0.83rem', fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text)' }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label>Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                value={title}
                onChange={e => { setTitle(e.target.value); if (error) setError(''); }}
                placeholder="Give your post a title…"
                disabled={uploading}
                style={title ? { borderColor: 'var(--accent)' } : {}}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Description</label>
                <span style={{ fontSize: '0.71rem', color: description.length > 450 ? 'var(--danger)' : 'var(--muted)' }}>
                  {description.length} / 500
                </span>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Share more details…"
                rows={3}
                disabled={uploading}
                maxLength={500}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>

            {/* File upload zone */}
            {selectedType.accept && (
              <div className="form-group">
                <label>
                  {selectedType.label} File <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${selectedFile ? 'var(--accent)' : 'var(--panel-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    cursor: uploading ? 'default' : 'pointer',
                    background: selectedFile ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s',
                  }}
                >
                  <TypeIcon size={24} style={{ color: selectedFile ? 'var(--accent)' : 'var(--muted)', marginBottom: '0.5rem' }} />
                  {selectedFile ? (
                    <>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB · Click to change
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                        Click to select a {selectedType.label.toLowerCase()}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Max 50 MB</div>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept={selectedType.accept} onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
              </div>
            )}

            {/* Error */}
            {error && <div className="auth-error">{error}</div>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={uploading} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={uploading} style={{ flex: 2, justifyContent: 'center' }}>
                <Plus size={14} /> {uploading ? 'Publishing…' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isPrivileged, isShopManager } = useAuth();
  const { toast } = useToast();
  const [profile,        setProfile]        = useState(null);
  const [badges,         setBadges]         = useState([]);
  const [posts,          setPosts]          = useState([]);
  const [archivedPosts,  setArchivedPosts]  = useState([]);
  const [history,        setHistory]        = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('posts');
  const [showEdit,       setShowEdit]       = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [listModal,   setListModal]   = useState(null);
  const [listUsers,   setListUsers]   = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const tasks = [
      getProfile(user.id),
      getUserBadges(user.id),
      getUserPosts(user.id),
      getArchivedPosts(user.id),
      getPointHistory(user.id),
    ];
    if (!isShopManager) tasks.push(getFollowing(user.id));
    Promise.all(tasks).then(([p, b, po, arch, h, following]) => {
      setProfile(p);
      setBadges(b);
      setPosts(po);
      setArchivedPosts(arch);
      setHistory(h);
      if (following) setFollowingCount(following.length);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  function handleProfileSaved(updated) {
    setProfile(prev => ({ ...prev, ...updated }));
  }

  async function handleUpdatePost(postId, data) {
    try {
      const updated = await updatePost(postId, { ...data, requestingUserId: user.id });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updated } : p));
      setArchivedPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updated } : p));
      toast('Post updated!');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleArchivePost(postId) {
    try {
      await archivePost(postId, user.id);
      const post = posts.find(p => p.id === postId);
      if (post) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setArchivedPosts(prev => [{ ...post, archived: true }, ...prev]);
      }
      toast('Post archived. You can restore it from the Archived tab.');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleUnarchivePost(postId) {
    try {
      await unarchivePost(postId, user.id);
      const post = archivedPosts.find(p => p.id === postId);
      if (post) {
        setArchivedPosts(prev => prev.filter(p => p.id !== postId));
        setPosts(prev => {
          const restored = { ...post, archived: false };
          const next = [...prev, restored];
          return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      }
      toast('Post restored to your profile!');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function openList(type) {
    setListModal(type);
    setListLoading(true);
    setListUsers([]);
    try {
      let data = [];
      if (type === 'friends') {
        const friendships = await getFriends(user.id);
        data = friendships.map(f => f.otherUser).filter(Boolean);
      } else if (type === 'following') {
        data = await getFollowing(user.id);
      } else if (type === 'followers') {
        data = await getFollowers(user.id);
      }
      setListUsers(data);
    } catch (err) {
      toast(err.message, 'error');
      setListModal(null);
    } finally {
      setListLoading(false);
    }
  }

  async function handleListAction(targetUserId) {
    try {
      if (listModal === 'friends') {
        const friendships = await getFriends(user.id);
        const fs = friendships.find(f => f.otherUser?.id === targetUserId);
        if (fs) await removeFriendship(fs.id);
        toast('Friend removed.');
      } else if (listModal === 'following') {
        await unfollow(user.id, targetUserId);
        toast('Unfollowed.');
      }
      setListUsers(prev => prev.filter(u => u.id !== targetUserId));
      setProfile(prev => {
        if (!prev) return prev;
        if (listModal === 'friends')   return { ...prev, friendCount:    Math.max(0, (prev.friendCount    ?? 1) - 1) };
        if (listModal === 'following') return { ...prev, followingCount: Math.max(0, (prev.followingCount ?? 1) - 1) };
        return prev;
      });
    } catch (err) { toast(err.message, 'error'); }
  }

  if (loading) return <div className="app-layout"><Navbar /><main className="page-content"><LoadingSpinner /></main></div>;

  const tabs = [
    { id: 'posts',    label: `Posts (${posts.length})` },
    { id: 'archived', label: `Archived (${archivedPosts.length})`, icon: Archive },
    ...(!isShopManager ? [{ id: 'badges',  label: `Badges (${badges.length})` }] : []),
    ...(!isPrivileged  ? [{ id: 'history', label: 'XP History'               }] : []),
  ];

  const stats = isShopManager
    ? [
        { label: 'Posts',     value: profile?.postCount      ?? posts.length, onClick: null },
        { label: 'Followers', value: profile?.followersCount ?? 0,            onClick: () => openList('followers') },
      ]
    : [
        { label: 'Posts',     value: profile?.postCount      ?? posts.length,    onClick: null },
        { label: 'Friends',   value: profile?.friendCount    ?? 0,               onClick: () => openList('friends') },
        { label: 'Following', value: profile?.followingCount ?? followingCount,  onClick: () => openList('following') },
        { label: 'Badges',    value: badges.length,                              onClick: null },
      ];

  return (
    <div className="app-layout">
      <Navbar points={profile?.currentPoints} />
      <main className="page-content">
        <div className="profile-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="panel profile-card">
              <Avatar user={profile} size="lg" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                <strong style={{ fontSize: '1rem' }}>{profile?.fullName}</strong>
                {profile?.accountType === 'SHOP_MANAGER' && profile?.verificationStatus === 'VERIFIED' && (
                  <BadgeCheck size={15} style={{ color: '#3b82f6' }} title="Verified Shop Manager" />
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>@{profile?.username}</span>
              {profile?.accountType === 'SHOP_MANAGER' && profile?.verificationStatus === 'PENDING' && (
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', background: 'rgba(255,202,85,0.1)', border: '1px solid rgba(255,202,85,0.3)', borderRadius: 99, padding: '2px 10px', marginTop: '0.2rem' }}>
                  Pending shop manager approval
                </span>
              )}
              {profile?.bio && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, textAlign: 'center', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                  {profile.bio}
                </p>
              )}
              {!isPrivileged && (
                <>
                  <div className="xp-chip gold" style={{ marginTop: '0.25rem' }}><Coins size={12} /> {profile?.currentPoints} XP</div>
                  <div className="xp-chip green" style={{ marginTop: '0.25rem' }}><Zap size={12} /> {profile?.totalEarnedPoints} total XP</div>
                </>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>
                  <Edit2 size={13} /> Edit profile
                </button>
                {isShopManager && (
                  <button className="btn btn-primary btn-sm" onClick={() => setShowCreatePost(true)}>
                    <Plus size={13} /> New Post
                  </button>
                )}
              </div>
            </div>

            <div className="stats-row">
              {stats.map(({ label, value, onClick }) => (
                <div key={label} className="stat-box" onClick={onClick ?? undefined} style={onClick ? { cursor: 'pointer' } : undefined} title={onClick ? `View ${label.toLowerCase()}` : undefined}>
                  <div className="value">{value}</div>
                  <div className="label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex-center gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
              {tabs.map(t => (
                <button key={t.id} className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab(t.id)}>
                  {t.icon && <t.icon size={12} />} {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'posts' && (
              posts.length > 0
                ? <div className="feed-list">{posts.map(p => <PostCard key={p.id} post={p} currentUserId={user.id} onEdit={handleUpdatePost} onArchive={handleArchivePost} />)}</div>
                : <EmptyState title="No posts yet" message="Share your first post to earn XP." />
            )}

            {activeTab === 'archived' && (
              archivedPosts.length > 0
                ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.9rem', marginBottom: '0.75rem', background: 'rgba(255,202,85,0.06)', border: '1px solid rgba(255,202,85,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--gold)' }}>
                      <Archive size={14} /> These posts are hidden from your profile and the feed. Only you can see them.
                    </div>
                    <div className="feed-list">{archivedPosts.map(p => <PostCard key={p.id} post={p} currentUserId={user.id} onEdit={handleUpdatePost} onUnarchive={handleUnarchivePost} />)}</div>
                  </>
                )
                : <EmptyState title="No archived posts" message="Posts you archive will appear here. Nothing is ever deleted." action={{ label: 'Back to Posts', onClick: () => setActiveTab('posts') }} />
            )}

            {activeTab === 'badges' && (
              badges.length > 0
                ? <div className="badge-grid">{badges.map(ub => <BadgeCard key={ub.id} badge={ub.badge} earnedAt={ub.earnedAt} />)}</div>
                : <EmptyState title="No badges yet" message="Complete activities to earn badges." />
            )}

            {activeTab === 'history' && !isPrivileged && (
              history.length > 0
                ? <div className="tx-list">{history.map(tx => (
                    <div key={tx.id} className="tx-row">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tx.reason}</div>
                        <div className="tx-reason">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`tx-amount ${tx.type === 'EARNED' ? 'earned' : 'spend'}`}>
                        {tx.type === 'EARNED' ? '+' : '-'}{tx.amount} XP
                      </span>
                    </div>
                  ))}</div>
                : <EmptyState title="No XP history" />
            )}
          </div>
        </div>
      </main>

      {showEdit && profile && (
        <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} onSaved={handleProfileSaved} />
      )}

      {showCreatePost && (
        <CreatePostModal
          userId={user.id}
          onClose={() => setShowCreatePost(false)}
          onCreated={post => { setPosts(prev => [post, ...prev]); setShowCreatePost(false); setActiveTab('posts'); }}
        />
      )}

      {listModal && (
        <UserListModal
          title={{ friends: 'Friends', following: 'Following', followers: 'Followers' }[listModal]}
          users={listUsers}
          loading={listLoading}
          onClose={() => setListModal(null)}
          onAction={listModal === 'friends' || listModal === 'following' ? handleListAction : undefined}
          actionLabel={listModal === 'friends' ? 'Unfriend' : listModal === 'following' ? 'Unfollow' : undefined}
        />
      )}
    </div>
  );
}
