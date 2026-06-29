import { post } from './client.js';

export const login    = (username, password)                          => post('/auth/login',    { username, password });
export const register = (username, email, fullName, password, accountType) =>
  post('/auth/register', { username, email, fullName, password, accountType: accountType || 'USER' });
