import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { getLeaderboardRows, getUserStats, serializeUser, serializeWorkout, getMostActiveUser } from '../utils/stats.js';
import { getAllUsers, getAllWorkouts } from '../store.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const [users, workouts] = await Promise.all([getAllUsers(), getAllWorkouts()]);
  const leaderboard = getLeaderboardRows(users, workouts).slice(0, 5);
  const profileWorkouts = workouts.filter((workout) => workout.userId.toString() === req.user._id.toString());
  const recentWorkouts = profileWorkouts.slice(0, 5).map((workout) => {
    const user = users.find((entry) => entry._id.toString() === workout.userId.toString());
    return serializeWorkout(workout, user);
  });

  const platformStats = {
    totalUsers: users.length,
    totalWorkouts: workouts.length,
    mostActiveUser: getMostActiveUser(users, workouts) ? serializeUser(getMostActiveUser(users, workouts)) : null,
  };

  res.json({
    me: {
      user: serializeUser(req.user),
      stats: getUserStats(req.user, profileWorkouts),
    },
    platformStats,
    leaderboard: leaderboard.map((row) => ({
      rank: row.rank,
      user: serializeUser(row.user),
      totalWorkoutDays: row.totalWorkoutDays,
      totalWorkoutMinutes: row.totalWorkoutMinutes,
      totalWorkoutHours: row.totalWorkoutHours,
      totalCaloriesBurned: row.totalCaloriesBurned,
    })),
    recentWorkouts,
  });
});

export default router;
