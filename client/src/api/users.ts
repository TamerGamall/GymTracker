import { apiRequest } from '../services/api';
import type { PublicUser, UserProfileResponse } from '../types';

export const usersApi = {
  me: () => apiRequest<UserProfileResponse>('/users/me'),
  profile: (userId: string) => apiRequest<UserProfileResponse>(`/users/${userId}`),
  updateWeight: (payload: { weight: number }) =>
    apiRequest<{ user: PublicUser }>('/users/update-weight', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
