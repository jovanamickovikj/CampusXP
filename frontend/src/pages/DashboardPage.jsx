import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Coins, FileText, Image, PenLine, Target, Trophy, Upload, Users, Video, X, Zap } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PostCard from '../components/PostCard.jsx';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getProfile } from '../api/users.js';
import { getFriendFeed, createPost, updatePost, archivePost, deletePost } from '../api/posts.js';
import { getUsers } from '../api/users.js';
import { uploadFile } from '../api/upload.js';

const POST_TYPES = [
  { value: 'TEXT',     label: 'Text',     icon: PenLine,  xp: 10, accept: null },
  { value: 'IMAGE',    label: 'Image',    icon: Image,    xp: 20, accept: 'image/jpeg,image/png,image/gif,image/webp' },
  { value: 'DOCUMENT', label: 'Document', icon: FileText, xp: 30, accept: 'application/pdf' },
  { value: 'VIDEO',    label: 'Video',    icon: Video,    xp: 40, accept: 'video/mp4,video/webm,video/ogg' },
];

function FilePreview({ file, postType }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!src) return null;

  if (postType === 'IMAGE') {
    return (
      <img
        src={src}
        alt="Preview"
        style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }}
      />
    );
  }
  if (postType === 'VIDEO') {
    return (
      <video
        src={src}
        controls
        style={{ width: '100%', maxHeight: 220, borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }}
      />
    );
  }
  if (postType === 'DOCUMENT') {
    return (
      <div style={{ padding: '0.6rem 0.9rem', background: 'var(--panel)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={14} /> {file.name} ({(file.size / 1024).toFixed(0)} KB)
      </div>
    );
  }
  return null;
}

function CreatePostModal({ userId, isShopManager, onClose, onCreated }) {
  const [postType,     setPostType]     = useState('TEXT');
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [error,        setError]        = useState('');
  const fileInputRef = useRef(null);

  const selectedType = POST_TYPES.find(t => t.value === postType);

  function switchType(type) {
    setPostType(type);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side size check (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File is too large. Maximum size is 50 MB.');
      e.target.value = '';
      return;
    }
    setError('');
    setSelectedFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (selectedType.accept && !selectedFile) { setError(`Please select a ${selectedType.label.toLowerCase()} file to upload`); return; }

    setUploading(true);
    setError('');

    try {
      let fileUrl = null;

      if (selectedFile) {
        // Simulate upload progress (real progress requires XHR; fetch doesn't expose it)
        setUploadPct(30);
        const result = await uploadFile(selectedFile);
        setUploadPct(80);
        fileUrl = result.url;
      }

      setUploadPct(90);
      const post = await createPost({
        userId,
        title:       title.trim(),
        description: description.trim() || null,
        fileUrl,
        postType,
      });
      setUploadPct(100);
      onCreated(post);
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setUploadPct(0);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="panel" style={{ width: '100%', maxWidth: 500, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex-center gap-sm" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>Create Post</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={uploading}><X size={14} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Post type tabs */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>
              Type
            </label>
            <div className="flex-center gap-sm" style={{ flexWrap: 'wrap' }}>
              {POST_TYPES.map(({ value, label, icon: Icon, xp }) => (
                <button
                  key={value}
                  type="button"
                  className={`btn btn-sm ${postType === value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => switchType(value)}
                  disabled={uploading}
                >
                  <Icon size={13} /> {label}{!isShopManager && <span style={{ opacity: 0.6, fontSize: '0.75rem' }}> +{xp} XP</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's this about?"
              maxLength={200}
              required
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>Caption / Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add context or a caption…"
              rows={3}
              style={{ resize: 'vertical' }}
              disabled={uploading}
            />
          </div>

          {/* File upload zone (for non-text types) */}
          {selectedType.accept && (
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>
                {selectedType.label} File *
              </label>

              {/* Preview */}
              {selectedFile && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <FilePreview file={selectedFile} postType={postType} />
                  {!uploading && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}
                      onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    >
                      <X size={12} /> Remove file
                    </button>
                  )}
                </div>
              )}

              {!selectedFile && (
                <div
                  style={{
                    border: '2px dashed var(--panel-border)', borderRadius: 'var(--radius-sm)',
                    padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const input = fileInputRef.current;
                      if (input) {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        input.files = dt.files;
                        handleFileChange({ target: input });
                      }
                    }
                  }}
                >
                  <Upload size={24} style={{ color: 'var(--muted)', marginBottom: '0.4rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to browse or drag & drop</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    {postType === 'IMAGE' && 'JPG, PNG, GIF, WEBP — max 50 MB'}
                    {postType === 'DOCUMENT' && 'PDF — max 50 MB'}
                    {postType === 'VIDEO' && 'MP4, WEBM, OGG — max 50 MB'}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={selectedType.accept}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>
          )}

          {/* Upload progress bar */}
          {uploading && uploadPct > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                {uploadPct < 80 ? 'Uploading file…' : uploadPct < 100 ? 'Creating post…' : 'Done!'}
              </div>
              <div style={{ height: 4, background: 'var(--panel-border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadPct}%`, background: 'var(--accent)', transition: 'width 0.3s ease', borderRadius: 2 }} />
              </div>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <div className="flex-center gap-sm" style={{ justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
              {uploading ? 'Publishing…' : isShopManager ? 'Publish' : `Publish & earn ${selectedType.xp}+ XP`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isPrivileged, isShopManager } = useAuth();
  const { toast } = useToast();
  const [profile,   setProfile]   = useState(null);
  const [feed,      setFeed]      = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      getProfile(user.id),
      getFriendFeed(user.id),
      getUsers(),
    ]).then(([p, f, u]) => {
      setProfile(p);
      setFeed(f);
      setUsers(u.filter(u => u.id !== user.id).slice(0, 4));
    }).finally(() => setLoading(false));
  }, [user?.id]);

  function handlePostCreated(post) {
    setShowModal(false);
    toast(post.pointsAwarded > 0 ? `Post published! You earned ${post.pointsAwarded} XP.` : 'Post published!');
    getProfile(user.id).then(setProfile);
    setFeed(prev => [post, ...prev]);
  }

  async function handleUpdatePost(postId, data) {
    try {
      const updated = await updatePost(postId, { ...data, requestingUserId: user.id });
      setFeed(prev => prev.map(p => p.id === postId ? { ...p, ...updated } : p));
      toast('Post updated!');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleArchivePost(postId) {
    try {
      await archivePost(postId, user.id);
      setFeed(prev => prev.filter(p => p.id !== postId));
      toast('Post archived.');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleDeletePost(postId) {
    try {
      await deletePost(postId, user.id);
      setFeed(prev => prev.filter(p => p.id !== postId));
      toast('Post deleted.');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div className="app-layout">
      <Navbar points={profile?.currentPoints} />
      <main className="page-content">
        {loading ? <LoadingSpinner /> : (
          <div className="dashboard-grid">
            {/* Left rail */}
            <aside className="dashboard-left">
              <div className="panel profile-card">
                <Avatar user={profile} size="lg" />
                <strong style={{ fontSize: '1rem' }}>{profile?.fullName}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>@{profile?.username}</span>
                {!isPrivileged && (
                  <div className="xp-chip gold" style={{ marginTop: '0.25rem' }}>
                    <Coins size={12} /> {profile?.currentPoints} XP
                  </div>
                )}
                <Link to="/profile" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                  View profile
                </Link>
              </div>

              <div className="panel" style={{ marginTop: '1rem' }}>
                <p className="panel-title">Quick stats</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    ...(!isPrivileged ? [
                      { label: 'Total XP earned', value: profile?.totalEarnedPoints, icon: Zap },
                      { label: 'Badges',           value: profile?.badges?.length ?? 0, icon: Trophy },
                    ] : []),
                    { label: 'Friends',          value: profile?.friendCount ?? 0, icon: Users },
                    { label: 'Posts',            value: profile?.postCount ?? 0, icon: Target },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex-center gap-sm" style={{ fontSize: '0.85rem' }}>
                      <Icon size={14} style={{ color: 'var(--muted)' }} />
                      <span style={{ color: 'var(--muted)', flex: 1 }}>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main feed */}
            <section>
              <div className="page-header" style={{ marginBottom: '1rem' }}>
                <span className="eyebrow">Friends activity</span>
                <div className="flex-center gap-sm">
                  <h1 style={{ flex: 1 }}>Mission feed</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                    <PenLine size={14} /> New post
                  </button>
                </div>
                <p>Latest posts from your campus network</p>
              </div>
              {feed.length > 0 ? (
                <div className="feed-list">
                  {feed.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      onEdit={handleUpdatePost}
                      onArchive={isAdmin ? undefined : handleArchivePost}
                      onDelete={isAdmin ? handleDeletePost : undefined}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing in your feed yet"
                  message="Add friends and their posts will appear here."
                  action={
                    <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                      <PenLine size={14} /> Create your first post
                    </button>
                  }
                />
              )}
            </section>

            {/* Right rail */}
            <aside className="dashboard-right">
              <div className="panel">
                <p className="panel-title">People on campus</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {users.map(u => (
                    <Link
                      key={u.id}
                      to={u.id === user?.id ? '/profile' : `/profile/${u.id}`}
                      className="flex-center gap-sm"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Avatar user={u} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.fullName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{u.currentPoints} XP</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/leaderboard"
                  className="flex-center gap-sm text-accent"
                  style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.75rem' }}
                >
                  View leaderboard <ChevronRight size={14} />
                </Link>
              </div>

              {!isPrivileged && (
                <div className="panel" style={{ marginTop: '1rem' }}>
                  <p className="panel-title">Earn XP</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                    Share posts, upload files, add friends and complete tasks to earn XP.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
                    onClick={() => setShowModal(true)}
                  >
                    <Upload size={14} /> Upload a post
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}

        {showModal && (
          <CreatePostModal
            userId={user.id}
            isShopManager={isShopManager}
            onClose={() => setShowModal(false)}
            onCreated={handlePostCreated}
          />
        )}
      </main>
    </div>
  );
}
