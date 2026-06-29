import { get, post, del } from './client.js';

/** Regular user follows a verified shop manager. */
export const follow        = (followerId, followingId) => post('/follows', { followerId, followingId });

/** Unfollow. */
export const unfollow      = (followerId, followingId) => del(`/follows?followerId=${followerId}&followingId=${followingId}`);

/** Returns { following: boolean }. */
export const followStatus  = (followerId, followingId) => get(`/follows/status?followerId=${followerId}&followingId=${followingId}`);

/** All users who follow the given shop manager. */
export const getFollowers  = (shopManagerId) => get(`/follows/followers/${shopManagerId}`);

/** All shop managers a user follows. */
export const getFollowing  = (userId) => get(`/follows/following/${userId}`);
