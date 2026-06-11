export type Gender = 'Male' | 'Female';
export type Role = 'user' | 'admin';

export interface WeightHistoryEntry {
  weight: number;
  date: string;
}

export interface PublicUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  weightHistory: WeightHistoryEntry[];
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  _id: string;
  userId: string;
  type: string;
  date: string;
  duration: number;
  calories: number;
  createdAt: string;
  updatedAt: string;
  user?: PublicUser;
}

export interface UserStats {
  bmi: number;
  totalWorkouts: number;
  totalWorkoutDays: number;
  totalWorkoutMinutes: number;
  totalWorkoutHours: number;
  totalCaloriesBurned: number;
}

export interface UserProfileResponse {
  user: PublicUser;
  stats: UserStats;
  recentWorkouts: Workout[];
}

export interface UserSummary extends PublicUser {
  stats: UserStats;
}

export interface LeaderboardRow {
  rank: number;
  user: PublicUser;
  totalWorkoutDays: number;
  totalWorkoutMinutes: number;
  totalWorkoutHours: number;
  totalCaloriesBurned: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalWorkouts: number;
  mostActiveUser: PublicUser | null;
}

export interface DashboardResponse {
  me: {
    user: PublicUser;
    stats: UserStats;
  };
  platformStats: PlatformStats;
  leaderboard: LeaderboardRow[];
  recentWorkouts: Workout[];
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}
