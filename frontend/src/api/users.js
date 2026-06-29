import { get, post, put, del } from './client.js';

export const getUsers        = ()              => get('/users');
export const getUser         = (id)            => get(`/users/${id}`);
export const getProfile      = (id)            => get(`/users/${id}/profile`);
export const updateUser      = (id, data)      => put(`/users/${id}`, data);
export const getPointHistory = (id)            => get(`/users/${id}/points/history`);
export const deleteUser      = (id)            => del(`/users/${id}`);

// Shop manager approval (admin only)
export const getPendingManagers  = ()              => get('/users/pending-managers');
export const verifyShopManager   = (id, status)   => put(`/users/${id}/verify`, { status });
