import { apiRequest } from '../services/api';
import type { LeaderboardRow } from '../types';

export const leaderboardApi = {
  list: () => apiRequest<{ leaderboard: LeaderboardRow[] }>('/leaderboard'),
};
