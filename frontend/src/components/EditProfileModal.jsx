import { useRef, useState } from 'react';
import { Camera, Save, Trash2, Upload, User, X } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { updateUser } from '../api/users.js';
import { uploadFile } from '../api/upload.js';

const BIO_LIMIT = 200;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Full-screen edit profile modal.
 * Props:
 *   profile  — current profile object from GET /users/:id/profile
 *   onClose  — called when modal should close
 *   onSaved  — called with updated UserSummaryResponse after a successful save
 */
export default function EditProfileModal({ profile, onClose, onSaved }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName:  profile.fullName  || '',
    username:  profile.username  || '',
    email:     '',                         // don't pre-fill for security
    bio:       profile.bio       || '',
    avatarUrl: profile.avatarUrl || '',
  });

  // Avatar management
  const [avatarPreview,  setAvatarPreview]  = useState(profile.avatarUrl || null);
  const [avatarFile,     setAvatarFile]     = useState(null); // pending File object
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError,    setAvatarError]    = useState('');
  const [removeAvatar,   setRemoveAvatar]   = useState(false); // user wants to remove current avatar
  const [confirmRemove,  setConfirmRemove]  = useState(false); // show confirmation

  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const fileInputRef = useRef(null);

  function field(name) {
    return (e) => {
      const val = e.target.value;
      setForm(f => ({ ...f, [name]: val }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    if (form.username.trim().length < 3) e.username = 'Username must be at least 3 characters';
    if (form.username.trim().includes(' ')) e.username = 'Username cannot contain spaces';
    if (form.bio.length > BIO_LIMIT) e.bio = `Bio must be under ${BIO_LIMIT} characters`;
    return e;
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError('Only PNG, JPG, JPEG, and WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError('Image must be under 5 MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  }

  function handleRemoveAvatar() {
    if (!profile.avatarUrl && !avatarPreview) return;
    setConfirmRemove(true);
  }

  function confirmRemoveAvatar() {
    setAvatarPreview(null);
    setAvatarFile(null);
    setRemoveAvatar(true);
    setConfirmRemove(false);
  }

  async function handleSave() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = form.avatarUrl;

      // If user picked a new file, upload it first
      if (avatarFile) {
        setUploadingAvatar(true);
        const uploadRes = await uploadFile(avatarFile);
        finalAvatarUrl = uploadRes.url;
        setUploadingAvatar(false);
      } else if (removeAvatar) {
        finalAvatarUrl = '';  // backend treats '' as null / remove
      }

      const payload = {
        username:  form.username.trim()  !== profile.username  ? form.username.trim()  : null,
        fullName:  form.fullName.trim()  !== profile.fullName  ? form.fullName.trim()  : null,
        email:     form.email.trim()     || null,
        avatarUrl: finalAvatarUrl,
        bio:       form.bio,
      };

      const updated = await updateUser(user.id, payload);

      // Sync auth context so avatar / username appear everywhere instantly
      refreshUser({
        username:  updated.username,
        avatarUrl: updated.avatarUrl,
        fullName:  updated.fullName,
      });

      toast('Profile updated!');
      onSaved(updated);
      onClose();
    } catch (err) {
      // Handle "Username already taken" as a field error
      if (err.message?.toLowerCase().includes('username')) {
        setErrors({ username: err.message });
      } else if (err.message?.toLowerCase().includes('email')) {
        setErrors({ email: err.message });
      } else {
        toast(err.message || 'Failed to save profile', 'error');
      }
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  }

  const bioRemaining = BIO_LIMIT - form.bio.length;
  const bioOverLimit = form.bio.length > BIO_LIMIT;

  // Synthetic "current" user for Avatar preview
  const previewUser = { ...profile, avatarUrl: avatarPreview };

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" style={{ maxWidth: 520, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--panel-border)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar user={previewUser} size="lg" />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: -4, right: -4,
                background: 'var(--accent)', border: '2px solid var(--bg)',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
              title="Upload new photo"
            >
              <Camera size={12} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>Profile picture</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              PNG, JPG, WEBP · Max 5 MB
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                <Upload size={13} /> {avatarFile ? 'Change photo' : 'Upload photo'}
              </button>
              {(avatarPreview || profile.avatarUrl) && (
                <button className="btn btn-danger btn-sm" onClick={handleRemoveAvatar}>
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
            {avatarError && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.4rem' }}>{avatarError}</p>}
            {avatarFile && <p style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: '0.4rem' }}>✓ New photo selected — save to apply</p>}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Full name + Username side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                value={form.fullName}
                onChange={field('fullName')}
                placeholder="Your full name"
                style={errors.fullName ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.fullName && <span style={{ fontSize: '0.73rem', color: 'var(--danger)' }}>{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Username <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                value={form.username}
                onChange={field('username')}
                placeholder="your_username"
                style={errors.username ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.username && <span style={{ fontSize: '0.73rem', color: 'var(--danger)' }}>{errors.username}</span>}
            </div>
          </div>

          {/* Bio */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Bio</label>
              <span style={{
                fontSize: '0.73rem',
                color: bioOverLimit ? 'var(--danger)' : bioRemaining <= 20 ? 'var(--gold)' : 'var(--muted)',
                fontWeight: bioOverLimit ? 700 : 400,
              }}>
                {form.bio.length} / {BIO_LIMIT}
              </span>
            </div>
            <textarea
              value={form.bio}
              onChange={field('bio')}
              placeholder="Tell people a little about yourself…"
              rows={3}
              style={{
                resize: 'vertical', minHeight: 80,
                borderColor: errors.bio ? 'var(--danger)' : undefined,
              }}
            />
            {errors.bio && <span style={{ fontSize: '0.73rem', color: 'var(--danger)' }}>{errors.bio}</span>}
          </div>

          {/* Email (optional change) */}
          <div className="form-group">
            <label>New Email <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 400 }}>(leave blank to keep current)</span></label>
            <input
              type="email"
              value={form.email}
              onChange={field('email')}
              placeholder="new@email.com"
              style={errors.email ? { borderColor: 'var(--danger)' } : {}}
            />
            {errors.email && <span style={{ fontSize: '0.73rem', color: 'var(--danger)' }}>{errors.email}</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploadingAvatar}>
            <Save size={14} />
            {uploadingAvatar ? 'Uploading photo…' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Confirm remove avatar dialog */}
      {confirmRemove && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmRemove(false); }}
        >
          <div className="modal" style={{ maxWidth: 340, textAlign: 'center' }}>
            <Trash2 size={28} style={{ color: 'var(--danger)', marginBottom: '0.75rem' }} />
            <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Remove profile picture?</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Your profile will show your initials instead.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-danger" onClick={confirmRemoveAvatar}>Yes, remove it</button>
              <button className="btn btn-ghost" onClick={() => setConfirmRemove(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
