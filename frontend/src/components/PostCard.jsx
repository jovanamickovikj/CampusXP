import { useEffect, useRef, useState } from 'react';
import { ArchiveRestore, BadgeCheck, ExternalLink, FileText, MoreVertical, Archive, Pencil, Save, Trash2, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

/** Blue verified checkmark shown for verified shop managers. */
function VerifiedBadge() {
  return (
    <BadgeCheck
      size={14}
      style={{ color: '#3b82f6', flexShrink: 0 }}
      title="Verified Shop Manager"
    />
  );
}

const TYPE_LABELS = { TEXT: 'Text', IMAGE: 'Image', DOCUMENT: 'Document', VIDEO: 'Video' };
const TYPE_COLORS = { TEXT: 'var(--accent)', IMAGE: 'var(--green)', DOCUMENT: 'var(--gold)', VIDEO: '#a78bfa' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function PostMedia({ post }) {
  const { fileUrl, postType } = post;
  if (!fileUrl) return null;

  const lower = fileUrl.toLowerCase();
  const isImage = postType === 'IMAGE' || lower.match(/\.(jpg|jpeg|png|gif|webp)/);
  const isVideo = postType === 'VIDEO' || lower.match(/\.(mp4|webm|ogg)/);
  const isPdf   = postType === 'DOCUMENT' || lower.includes('.pdf');

  if (isImage) {
    return (
      <img
        src={fileUrl} alt={post.title} loading="lazy"
        style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '0.6rem', border: '1px solid var(--panel-border)' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
  if (isVideo) {
    return (
      <video
        src={fileUrl} controls preload="metadata"
        style={{ width: '100%', maxHeight: 320, borderRadius: 'var(--radius-sm)', marginTop: '0.6rem', border: '1px solid var(--panel-border)' }}
      />
    );
  }
  if (isPdf) {
    return (
      <a
        href={fileUrl} target="_blank" rel="noopener noreferrer"
        style={{ marginTop: '0.6rem', padding: '0.55rem 0.9rem', background: 'rgba(255,202,85,0.08)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <FileText size={14} /> View document <ExternalLink size={12} style={{ opacity: 0.6 }} />
      </a>
    );
  }
  return (
    <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'block', marginTop: '0.4rem', wordBreak: 'break-all' }}>
      {fileUrl}
    </a>
  );
}

/**
 * Three-dot menu — shows actions based on which callbacks are provided.
 * - onEdit    → always shown (when present)
 * - onArchive → "Archive" (regular users)
 * - onDelete  → "Delete"  (admin)
 * - onUnarchive → "Unarchive" (archived tab)
 */
function PostMenu({ onEdit, onArchive, onDelete, onUnarchive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function act(fn) { setOpen(false); fn(); }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.2rem', display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}
        title="Post options"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 100,
          background: 'var(--panel)', border: '1px solid var(--panel-border)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
          minWidth: 150, overflow: 'hidden',
        }}>
          {onEdit && (
            <button
              onClick={() => act(onEdit)}
              style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}
            >
              <Pencil size={13} style={{ color: 'var(--accent)' }} /> Edit post
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => act(onArchive)}
              style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}
            >
              <Archive size={13} style={{ color: 'var(--gold)' }} /> Archive post
            </button>
          )}
          {onUnarchive && (
            <button
              onClick={() => act(onUnarchive)}
              style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}
            >
              <ArchiveRestore size={13} style={{ color: 'var(--green)' }} /> Unarchive
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => act(onDelete)}
              style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}
            >
              <Trash2 size={13} /> Delete post
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Inline edit form that replaces card content. */
function EditPostForm({ post, onSave, onCancel }) {
  const [title,       setTitle]       = useState(post.title       || '');
  const [description, setDescription] = useState(post.description || '');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  async function submit() {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(post.id, { title: title.trim(), description, fileUrl: post.fileUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>Editing post</p>
      {error && <div className="auth-error" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>{error}</div>}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Title <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Add a description…"
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>
          <Save size={13} /> {saving ? 'Saving…' : 'Save'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={saving}>
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

/** Archive confirmation inline (replaces card body). */
function ArchiveConfirm({ post, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await onConfirm(post.id);
  }

  return (
    <div style={{
      background: 'rgba(255,202,85,0.06)', border: '1px solid rgba(255,202,85,0.2)',
      borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center',
    }}>
      <Archive size={22} style={{ color: 'var(--gold)', marginBottom: '0.5rem' }} />
      <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>Archive this post?</p>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
        It will be hidden from your profile and feed, but nothing is deleted. You can restore it any time.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button
          className="btn btn-sm"
          onClick={confirm}
          disabled={busy}
          style={{ background: 'rgba(255,202,85,0.15)', color: 'var(--gold)', border: '1px solid rgba(255,202,85,0.4)' }}
        >
          <Archive size={13} /> {busy ? 'Archiving…' : 'Yes, archive'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </div>
  );
}

/** Delete confirmation inline (admin only). */
function DeleteConfirm({ post, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    await onConfirm(post.id);
  }

  return (
    <div style={{
      background: 'rgba(255,90,123,0.06)', border: '1px solid rgba(255,90,123,0.2)',
      borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center',
    }}>
      <Trash2 size={22} style={{ color: 'var(--danger)', marginBottom: '0.5rem' }} />
      <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>Permanently delete this post?</p>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>This action cannot be undone.</p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button className="btn btn-danger btn-sm" onClick={confirm} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={deleting}>Cancel</button>
      </div>
    </div>
  );
}

/**
 * PostCard
 *
 * Props:
 *   post          — post object (includes `archived` flag from backend)
 *   currentUserId — logged-in user id; menu only shows when this matches author
 *   onEdit        — async (postId, { title, description, fileUrl }) => void
 *   onArchive     — async (postId) => void  [regular users — shows Archive]
 *   onDelete      — async (postId) => void  [admin — shows Delete]
 *   onUnarchive   — async (postId) => void  [archived tab — shows Unarchive]
 */
export default function PostCard({ post, currentUserId, onEdit, onArchive, onDelete, onUnarchive }) {
  const author = post.author ?? post.user;
  const typeColor = TYPE_COLORS[post.postType] || 'var(--muted)';
  const profileLink = author?.id ? `/profile/${author.id}` : '#';
  const isOwner = currentUserId && author?.id && currentUserId === author.id;

  // 'view' | 'edit' | 'archive' | 'delete'
  const [mode, setMode] = useState('view');

  const [localPost, setLocalPost] = useState(post);
  useEffect(() => { setLocalPost(post); }, [post]);

  async function handleSave(postId, data) {
    await onEdit(postId, data);
    setLocalPost(prev => ({ ...prev, ...data }));
    setMode('view');
  }

  const hasMenu = isOwner && (onEdit || onArchive || onDelete || onUnarchive);

  return (
    <div className="post-card">
      <div className="post-card-header">
        <Link to={profileLink} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Avatar user={author} size="sm" />
        </Link>
        <div className="post-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Link to={profileLink} className="name" style={{ textDecoration: 'none', color: 'inherit' }}>
              {author?.fullName || author?.username}
            </Link>
            {author?.accountType === 'SHOP_MANAGER' && author?.verificationStatus === 'VERIFIED' && (
              <VerifiedBadge />
            )}
          </div>
          <span className="time">{timeAgo(localPost.createdAt)}</span>
        </div>
        <span className="post-type-badge" style={{ color: typeColor, borderColor: typeColor }}>
          {TYPE_LABELS[localPost.postType] || localPost.postType}
        </span>
        {hasMenu && mode === 'view' && (
          <PostMenu
            onEdit={onEdit ? () => setMode('edit') : undefined}
            onArchive={onArchive ? () => setMode('archive') : undefined}
            onDelete={onDelete ? () => setMode('delete') : undefined}
            onUnarchive={onUnarchive ? () => onUnarchive(localPost.id) : undefined}
          />
        )}
      </div>

      {mode === 'edit' ? (
        <EditPostForm
          post={localPost}
          onSave={handleSave}
          onCancel={() => setMode('view')}
        />
      ) : mode === 'archive' ? (
        <ArchiveConfirm
          post={localPost}
          onConfirm={onArchive}
          onCancel={() => setMode('view')}
        />
      ) : mode === 'delete' ? (
        <DeleteConfirm
          post={localPost}
          onConfirm={onDelete}
          onCancel={() => setMode('view')}
        />
      ) : (
        <>
          <h3 style={{ marginTop: '0.5rem', marginBottom: localPost.description ? '0.25rem' : 0 }}>
            {localPost.title}
          </h3>
          {localPost.description && (
            <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
              {localPost.description}
            </p>
          )}
          <PostMedia post={localPost} />
          {localPost.pointsAwarded > 0 && (
            <div className="post-points">
              <Zap size={13} /> +{localPost.pointsAwarded} XP earned
            </div>
          )}
        </>
      )}
    </div>
  );
}
