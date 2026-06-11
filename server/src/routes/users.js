import express from 'express';
import { adminOnly, authRequired } from '../middleware/auth.js';
import { getMonthlyStats, getUserStats, serializeUser, serializeWorkout } from '../utils/stats.js';
import {
  getAllWorkouts,
  findUserById,
  updateUser,
  deleteUser,
  deleteWorkoutsByUserId,
} from '../store.js';

const router = express.Router();

const buildProfile = async (user, period = 'all') => {
  const userId = user._id.toString();
  const workouts = (await getAllWorkouts()).filter((workout) => workout.userId.toString() === userId);
  const stats = period === 'month' ? getMonthlyStats(user, workouts) : getUserStats(user, workouts);
  const recentWorkouts = workouts.slice(0, 6).map((workout) => serializeWorkout(workout, user));

  return {
    user: serializeUser(user),
    stats,
    recentWorkouts,
  };
};

router.get('/', authRequired, async (req, res) => {
  res.status(403).json({ message: 'User directory is disabled.' });
});

router.get('/me', authRequired, async (req, res) => {
  const profile = await buildProfile(req.user, 'all');
  res.json(profile);
});

router.get('/:id', authRequired, async (req, res) => {
  if (req.params.id !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only view your own profile.' });
  }

  const user = await findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const profile = await buildProfile(user, 'all');
  res.json(profile);
});

router.patch('/:id', authRequired, async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'You can only edit your own profile.' });
  }

  const allowed = ['name', 'age', 'gender', 'height', 'weight'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await updateUser(req.params.id, updates);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({ user: serializeUser(user) });
});

router.post('/update-weight', authRequired, async (req, res) => {
  const currentUser = await findUserById(req.user._id.toString());
  if (!currentUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const weight = Number(req.body.weight);
  if (!weight || Number.isNaN(weight)) {
    return res.status(400).json({ message: 'weight is required.' });
  }

  const weightHistory = [...(currentUser.weightHistory ?? []), { weight, date: new Date() }];
  const updated = await updateUser(req.user._id.toString(), { weight, weightHistory });
  res.json({ user: serializeUser(updated) });
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const user = await deleteUser(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await deleteWorkoutsByUserId(req.params.id);
  res.json({ message: 'User deleted successfully.' });
});

export default router;
