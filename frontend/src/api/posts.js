import { get, post, put, del } from './client.js';

export const getUserPosts      = (userId)               => get(`/posts/user/${userId}`);
export const getArchivedPosts  = (userId)               => get(`/posts/user/${userId}/archived`);
export const getFriendFeed     = (userId)               => get(`/posts/feed/${userId}`);
export const createPost        = (data)                 => post('/posts', data);
export const updatePost        = (id, data)             => put(`/posts/${id}`, data);
export const archivePost       = (id, requestingUserId) => put(`/posts/${id}/archive?requestingUserId=${requestingUserId}`);
export const unarchivePost     = (id, requestingUserId) => put(`/posts/${id}/unarchive?requestingUserId=${requestingUserId}`);
export const deletePost        = (id, requestingUserId) => del(`/posts/${id}?requestingUserId=${requestingUserId}`);
