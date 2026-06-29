import { get, post, del } from './client.js';

export const getFriends          = (userId)                    => get(`/friends/${userId}`);
export const getPendingRequests  = (userId)                    => get(`/friends/${userId}/pending`);
export const getSentRequests     = (userId)                    => get(`/friends/${userId}/sent`);
export const getConnectedIds     = (userId)                    => get(`/friends/${userId}/connected-ids`);
export const getFriendshipStatus = (viewerId, targetId)        => get(`/friends/status?viewerId=${viewerId}&targetId=${targetId}`);
export const sendRequest         = (requesterId, receiverId)   => post('/friends/request', { requesterId, receiverId });
export const acceptFriendship    = (friendshipId)              => post(`/friends/accept/${friendshipId}`);
export const removeFriendship    = (friendshipId)              => del(`/friends/${friendshipId}`);
/** @deprecated use removeFriendship */
export const declineFriendship   = (friendshipId)              => del(`/friends/${friendshipId}`);
