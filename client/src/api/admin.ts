import { apiRequest } from './client';
import type { PublicUser, Workout, PlatformStats } from '../types';

export const adminApi = {
  stats: () => apiRequest<PlatformStats>('/admin/stats'),
  users: () => apiRequest<{ users: PublicUser[] }>('/admin/users'),
  workouts: () => apiRequest<{ workouts: Workout[] }>('/admin/workouts'),
  deleteUser: (userId: string) =>
    apiRequest<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),
};
