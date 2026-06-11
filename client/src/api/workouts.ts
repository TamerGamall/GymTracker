import { apiRequest } from '../services/api';
import type { Workout } from '../types';

export const workoutsApi = {
  listMine: () => apiRequest<{ workouts: Workout[] }>('/workouts?scope=mine'),
  listAll: () => apiRequest<{ workouts: Workout[] }>('/workouts'),
  create: (payload: { type: string; date: string; duration: number; userId?: string }) =>
    apiRequest<{ workout: Workout }>('/workouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (workoutId: string, payload: Partial<{ userId: string; type: string; date: string; duration: number }>) =>
    apiRequest<{ workout: Workout }>(`/workouts/${workoutId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (workoutId: string) =>
    apiRequest<{ message: string }>(`/workouts/${workoutId}`, {
      method: 'DELETE',
    }),
};
