import { apiRequest } from '../services/api';
import type { DashboardResponse } from '../types';

export const dashboardApi = {
  get: () => apiRequest<DashboardResponse>('/dashboard'),
};
