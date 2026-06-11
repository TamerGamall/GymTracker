import express from 'express';
import { adminOnly, authRequired } from '../middleware/auth.js';
import { getMostActiveUser, serializeUser, serializeWorkout } from '../utils/stats.js';
import { countUsers, countWorkouts, getAllUsers, getAllWorkouts, deleteUser, deleteWorkoutsByUserId } from '../store.js';

const router = express.Router();

router.use(authRequired, adminOnly);

router.get('/stats', async (req, res) => {
  const [totalUsers, totalWorkouts, users, workouts] = await Promise.all([
    countUsers(),
    countWorkouts(),
    getAllUsers(),
    getAllWorkouts(),
  ]);

  const mostActiveUser = getMostActiveUser(users, workouts);

  res.json({
    totalUsers,
    totalWorkouts,
    mostActiveUser: mostActiveUser ? serializeUser(mostActiveUser) : null,
  });
});

router.get('/users', async (req, res) => {
  const users = await getAllUsers();
  res.json({
    users: users.map((user) => serializeUser(user)),
  });
});

router.get('/workouts', async (req, res) => {
  const workouts = await getAllWorkouts();
  const users = await getAllUsers();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  res.json({
    workouts: workouts.map((workout) => serializeWorkout(workout, userMap.get(workout.userId.toString()))),
  });
});

router.delete('/users/:id', async (req, res) => {
  const user = await deleteUser(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await deleteWorkoutsByUserId(req.params.id);
  res.json({ message: 'User deleted successfully.' });
});

export default router;
