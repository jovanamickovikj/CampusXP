import { get, post } from './client.js';

export const getAllBadges      = ()                   => get('/badges');
export const getUserBadges     = (userId)             => get(`/badges/user/${userId}`);
export const createBadge       = (data)               => post('/badges', data);
export const awardBadge        = (userId, badgeId)    => post('/badges/award', { userId, badgeId });
