import { useEffect, useRef, useState } from 'react';
import { Edit2, Image, Plus, Trash2, Upload, X } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAllItems, getMyItems, createItem, updateItem, deleteItem } from '../../api/shop.js';
import { uploadFile } from '../../api/upload.js';

const EMPTY_FORM = { name: '', description: '', imageUrl: '', pricePoints: '', quantity: '' };

export default function AdminShopPage() {
  const { toast }                   = useToast();
  const { user, isAdmin }           = useAuth();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const imageInputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  function loadItems() {
    const loader = isAdmin ? getAllItems() : getMyItems(user.id);
    return loader.then(setItems).finally(() => setLoading(false));
  }

  useEffect(() => { loadItems(); }, []);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditTarget(item);
    setForm({
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl || '',
      pricePoints: String(item.pricePoints),
      quantity: String(item.quantity),
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || null);
    setError('');
    setShowModal(true);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); return; }
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setForm(p => ({ ...p, imageUrl: '' }));
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  async function handleSave() {
    if (!form.name || !form.pricePoints || !form.quantity) {
      setError('Name, price, and quantity are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let imageUrl = form.imageUrl || null;

      // Upload new image if one was selected
      if (imageFile) {
        setUploading(true);
        const result = await uploadFile(imageFile);
        imageUrl = result.url;
        setUploading(false);
      }

      const payload = {
        name: form.name,
        description: form.description,
        imageUrl,
        pricePoints: parseInt(form.pricePoints),
        quantity: parseInt(form.quantity),
      };
      if (editTarget) {
        await updateItem(editTarget.id, user.id, payload);
      } else {
        await createItem(user.id, payload);
      }
      setShowModal(false);
      loadItems();
      toast(editTarget ? 'Item updated.' : 'Item created.');
    } catch (err) {
      setUploading(false);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteItem(deleteTarget.id, user.id);
      setDeleteTarget(null);
      toast(`"${deleteTarget.name}" deactivated.`);
      loadItems();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  // Shop managers can only edit/delete their own items
  function canManage(item) {
    if (isAdmin) return true;
    return item.createdById === user.id;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <span className="eyebrow">{isAdmin ? 'Admin' : 'Shop Manager'}</span>
          <h1>Shop Management</h1>
          {!isAdmin && <p>You can manage only items you created.</p>}
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add item
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="panel">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price (XP)</th>
                    <th>Stock</th>
                    {isAdmin && <th>Creator</th>}
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={!canManage(item) ? { opacity: 0.55 } : {}}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          {item.purchaseCount > 0
                            ? `${item.purchaseCount}/${item.initialQuantity} sold`
                            : item.description}
                        </div>
                      </td>
                      <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{item.pricePoints} XP</td>
                      <td>{item.quantity}</td>
                      {isAdmin && (
                        <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          {item.createdByUsername ? `@${item.createdByUsername}` : <span style={{ opacity: 0.5 }}>admin</span>}
                        </td>
                      )}
                      <td>
                        <span className={`tag ${item.active ? 'tag-social' : 'tag-activity'}`}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {canManage(item) && (
                          <div className="flex-center gap-sm">
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>
                              <Edit2 size={13} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="flex-center gap-sm mb-md">
                <h2 style={{ margin: 0 }}>{editTarget ? 'Edit item' : 'Add item'}</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ marginLeft: 'auto' }}>
                  <X size={15} />
                </button>
              </div>

              {error && <div className="auth-error mb-md">{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'name',        label: 'Item name *',  type: 'text',   placeholder: 'Campus Hoodie' },
                  { name: 'description', label: 'Description',  type: 'text',   placeholder: 'Short description' },
                  { name: 'pricePoints', label: 'Price (XP) *', type: 'number', placeholder: '100' },
                  { name: 'quantity',    label: 'Quantity *',   type: 'number', placeholder: '10' },
                ].map(f => (
                  <div className="form-group" key={f.name}>
                    <label>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.name]}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      placeholder={f.placeholder}
                      min={f.type === 'number' ? 0 : undefined}
                    />
                  </div>
                ))}

                {/* Image upload */}
                <div className="form-group">
                  <label>Product Image <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '0.78rem' }}>(optional)</span></label>
                  {imagePreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={clearImage}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'var(--panel)' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{ border: '2px dashed var(--panel-border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Image size={22} style={{ color: 'var(--muted)', marginBottom: '0.3rem' }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Click to upload image</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>JPG, PNG, WEBP — max 10 MB</div>
                    </div>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {uploading ? 'Uploading image…' : saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && !deleting && setDeleteTarget(null)}>
            <div className="modal" style={{ maxWidth: 400 }}>
              <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
                <Trash2 size={28} style={{ color: 'var(--danger)', marginBottom: '0.75rem' }} />
                <h3 style={{ marginBottom: '0.4rem' }}>Deactivate item?</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  "<strong>{deleteTarget.name}</strong>" will be marked inactive and hidden from the shop.
                </p>
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? 'Deactivating…' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
