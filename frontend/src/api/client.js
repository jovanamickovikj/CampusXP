/**
 * Thin fetch wrapper.
 * - Attaches the JWT from localStorage to every request.
 * - Throws a plain Error with the backend's message on non-2xx responses.
 */

const BASE = '/api';

function getToken() {
  return localStorage.getItem('campusxp_token');
}

export async function request(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {
      /* ignore parse error */
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const get  = (path)         => request(path);
export const post = (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) });
export const put  = (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) });
export const del  = (path)         => request(path, { method: 'DELETE' });
