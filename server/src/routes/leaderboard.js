import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { getLeaderboardRows, serializeUser } from '../utils/stats.js';
import { getAllUsers, getAllWorkouts } from '../store.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const users = await getAllUsers();
  const workouts = await getAllWorkouts();
  const rows = getLeaderboardRows(users, workouts);

  res.json({
    leaderboard: rows.map((row) => ({
      rank: row.rank,
      user: serializeUser(row.user),
      totalWorkoutDays: row.totalWorkoutDays,
      totalWorkoutMinutes: row.totalWorkoutMinutes,
      totalWorkoutHours: row.totalWorkoutHours,
      totalCaloriesBurned: row.totalCaloriesBurned,
    })),
  });
});

export default router;
