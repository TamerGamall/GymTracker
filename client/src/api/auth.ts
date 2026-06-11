import { apiRequest } from '../services/api';
import type { AuthResponse, PublicUser } from '../types';

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: { name: string; email: string; password: string; age: number; gender: 'Male' | 'Female'; height: number; weight: number }) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => apiRequest<{ user: PublicUser }>('/auth/me'),
};
