import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { calculateCalories, getLatestWeight, serializeWorkout } from '../utils/stats.js';
import {
  findUserById,
  findWorkouts,
  findWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../store.js';

const router = express.Router();

const canAccessWorkout = (req, workout) =>
  req.user.role === 'admin' || workout.userId.toString() === req.user._id.toString();

router.get('/', authRequired, async (req, res) => {
  const { userId, scope } = req.query;

  const query = {};
  if (scope === 'mine' || (userId && req.user.role !== 'admin')) {
    query.userId = req.user._id;
  } else if (userId) {
    query.userId = userId;
  } else if (req.user.role !== 'admin') {
    query.userId = req.user._id;
  }

  const workouts = await findWorkouts(query);
  const users = await Promise.all([...new Set(workouts.map((workout) => workout.userId.toString()))].map((id) => findUserById(id)));
  const userMap = new Map(users.filter(Boolean).map((user) => [user._id.toString(), user]));

  res.json({
    workouts: workouts.map((workout) => serializeWorkout(workout, userMap.get(workout.userId.toString()))),
  });
});

router.post('/', authRequired, async (req, res) => {
  const { userId, type, date, duration } = req.body;
  const targetUserId = req.user.role === 'admin' && userId ? userId : req.user._id.toString();
  const user = await findUserById(targetUserId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (!type || !date || !duration) {
    return res.status(400).json({ message: 'type, date, and duration are required.' });
  }

  const calories = calculateCalories(Number(duration), getLatestWeight(user));
  const workout = await createWorkout({
    userId: user._id.toString(),
    type,
    date,
    duration: Number(duration),
    calories,
  });

  res.status(201).json({ workout: serializeWorkout(workout, user) });
});

router.patch('/:id', authRequired, async (req, res) => {
  const workout = await findWorkoutById(req.params.id);
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found.' });
  }

  if (!canAccessWorkout(req, workout)) {
    return res.status(403).json({ message: 'You cannot update this workout.' });
  }

  const nextUserId = req.body.userId || workout.userId;
  const user = await findUserById(nextUserId);
  if (!user) {
    return res.status(404).json({ message: 'Target user not found.' });
  }

  const effectiveDuration = req.body.duration ? Number(req.body.duration) : workout.duration;
  const updated = await updateWorkout(req.params.id, {
    userId: user._id,
    type: req.body.type ?? workout.type,
    date: req.body.date ?? workout.date,
    duration: effectiveDuration,
    calories: calculateCalories(effectiveDuration, getLatestWeight(user)),
  });

  res.json({ workout: serializeWorkout(updated, user) });
});

router.delete('/:id', authRequired, async (req, res) => {
  const workout = await findWorkoutById(req.params.id);
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found.' });
  }

  if (!canAccessWorkout(req, workout)) {
    return res.status(403).json({ message: 'You cannot delete this workout.' });
  }

  await deleteWorkout(req.params.id);
  res.json({ message: 'Workout deleted successfully.' });
});

export default router;
