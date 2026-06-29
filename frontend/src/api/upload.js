/**
 * Upload a file to the backend.
 * Returns { url: "/api/files/uuid.ext" }
 */
export async function uploadFile(file) {
  const token = localStorage.getItem('campusxp_token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    // Do NOT set Content-Type — browser sets it with the correct boundary for multipart
  });

  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const err = await response.json();
      message = err.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return response.json(); // { url: "/api/files/..." }
}
