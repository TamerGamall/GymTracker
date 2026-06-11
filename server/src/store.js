import { randomUUID } from 'node:crypto';
import { User } from './models/User.js';
import { Workout } from './models/Workout.js';

let mode = 'mongo';
let memoryUsers = [];
let memoryWorkouts = [];

const now = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value));

export const setMongoStore = () => {
  mode = 'mongo';
};

export const setMemoryStore = ({ users, workouts }) => {
  mode = 'memory';
  memoryUsers = clone(users);
  memoryWorkouts = clone(workouts);
};

export const getStoreMode = () => mode;

export const countUsers = async () => (mode === 'mongo' ? User.countDocuments() : memoryUsers.length);
export const countWorkouts = async () => (mode === 'mongo' ? Workout.countDocuments() : memoryWorkouts.length);

export const findUsers = async () =>
  mode === 'mongo'
    ? User.find().sort({ createdAt: -1 })
    : [...memoryUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const findUserById = async (userId) => {
  if (mode === 'mongo') return User.findById(userId);
  return memoryUsers.find((user) => user._id === userId || user.id === userId) ?? null;
};

export const findUserByEmail = async (email) => {
  if (mode === 'mongo') return User.findOne({ email: email.toLowerCase() });
  return memoryUsers.find((user) => user.email === email.toLowerCase()) ?? null;
};

export const createUser = async (payload) => {
  if (mode === 'mongo') return User.create(payload);

  const user = {
    _id: randomUUID(),
    id: randomUUID(),
    createdAt: now(),
    updatedAt: now(),
    ...payload,
  };
  memoryUsers.push(user);
  return user;
};

export const updateUser = async (userId, updates) => {
  if (mode === 'mongo') return User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

  const index = memoryUsers.findIndex((user) => user._id === userId || user.id === userId);
  if (index === -1) return null;
  memoryUsers[index] = { ...memoryUsers[index], ...updates, updatedAt: now() };
  return memoryUsers[index];
};

export const deleteUser = async (userId) => {
  if (mode === 'mongo') return User.findByIdAndDelete(userId);

  const index = memoryUsers.findIndex((user) => user._id === userId || user.id === userId);
  if (index === -1) return null;
  const [deleted] = memoryUsers.splice(index, 1);
  memoryWorkouts = memoryWorkouts.filter((workout) => workout.userId !== userId && workout.userId !== deleted._id);
  return deleted;
};

export const deleteWorkoutsByUserId = async (userId) => {
  if (mode === 'mongo') {
    await Workout.deleteMany({ userId });
    return;
  }
  memoryWorkouts = memoryWorkouts.filter((workout) => workout.userId !== userId);
};

export const findWorkouts = async (query = {}) => {
  if (mode === 'mongo') {
    return Workout.find(query).sort({ date: -1 });
  }

  const filtered = memoryWorkouts.filter((workout) => {
    if (query.userId) {
      return workout.userId === query.userId || workout.userId === query.userId.toString();
    }
    return true;
  });

  return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const findWorkoutById = async (workoutId) => {
  if (mode === 'mongo') return Workout.findById(workoutId);
  return memoryWorkouts.find((workout) => workout._id === workoutId || workout.id === workoutId) ?? null;
};

export const createWorkout = async (payload) => {
  if (mode === 'mongo') return Workout.create(payload);

  const workout = {
    _id: randomUUID(),
    id: randomUUID(),
    createdAt: now(),
    updatedAt: now(),
    ...payload,
  };
  memoryWorkouts.push(workout);
  return workout;
};

export const updateWorkout = async (workoutId, updates) => {
  if (mode === 'mongo') {
    return Workout.findByIdAndUpdate(workoutId, updates, { new: true, runValidators: true });
  }

  const index = memoryWorkouts.findIndex((workout) => workout._id === workoutId || workout.id === workoutId);
  if (index === -1) return null;
  memoryWorkouts[index] = { ...memoryWorkouts[index], ...updates, updatedAt: now() };
  return memoryWorkouts[index];
};

export const deleteWorkout = async (workoutId) => {
  if (mode === 'mongo') return Workout.findByIdAndDelete(workoutId);

  const index = memoryWorkouts.findIndex((workout) => workout._id === workoutId || workout.id === workoutId);
  if (index === -1) return null;
  const [deleted] = memoryWorkouts.splice(index, 1);
  return deleted;
};

export const getAllUsers = async () => findUsers();

export const getAllWorkouts = async () => findWorkouts();
