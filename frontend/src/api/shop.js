import { get, post, put, del } from './client.js';

// Public browsing
export const getShopItems  = ()            => get('/shop/items');
export const getAllItems    = ()            => get('/shop/items/all');     // ADMIN
export const getShopItem   = (id)          => get(`/shop/items/${id}`);
export const getMyItems    = (userId)      => get(`/shop/items/mine?userId=${userId}`);

// Shop management — requestingUserId required; service layer enforces permissions
export const createItem = (userId, data) =>
  post('/shop/items', { requestingUserId: userId, ...data });

export const updateItem = (id, userId, data) =>
  put(`/shop/items/${id}`, { requestingUserId: userId, ...data });

export const deleteItem = (id, userId) =>
  del(`/shop/items/${id}?requestingUserId=${userId}`);

// Purchases — regular users only
export const purchase       = (userId, shopItemId) => post('/shop/purchase', { userId, shopItemId });
export const getPurchases   = (userId)             => get(`/shop/purchases/${userId}`);
export const getInventory   = (userId)             => get(`/shop/inventory/${userId}`);
export const getUsedHistory = (userId)             => get(`/shop/purchases/history/${userId}`);
export const useItem        = (purchaseId)         => put(`/shop/purchases/${purchaseId}/use`);
