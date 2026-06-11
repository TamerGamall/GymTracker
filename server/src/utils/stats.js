export const calculateCalories = (duration, weight) => Number((duration * weight * 0.08).toFixed(2));

export const calculateBmi = (weight, height) => Number((weight / ((height / 100) ** 2)).toFixed(1));

export const getId = (value) => {
  if (value == null) return '';
  return typeof value === 'string' ? value : value.toString();
};

export const getLatestWeight = (user) => {
  const history = Array.isArray(user.weightHistory) ? user.weightHistory : [];
  const latest = history[history.length - 1];
  return Number(latest?.weight ?? user.weight);
};

export const getMonthRange = (referenceDate = new Date()) => {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  return { start, end };
};

export const serializeUser = (user) => ({
  id: getId(user._id ?? user.id),
  _id: getId(user._id ?? user.id),
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  height: user.height,
  weight: user.weight,
  weightHistory: (user.weightHistory ?? []).map((entry) => ({
    weight: entry.weight,
    date: new Date(entry.date).toISOString(),
  })),
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const serializeWorkout = (workout, user) => ({
  id: getId(workout._id ?? workout.id),
  _id: getId(workout._id ?? workout.id),
  userId: getId(workout.userId),
  type: workout.type,
  date: workout.date,
  duration: workout.duration,
  calories: user ? calculateCalories(workout.duration, getLatestWeight(user)) : workout.calories,
  createdAt: workout.createdAt,
  updatedAt: workout.updatedAt,
  user: user ? serializeUser(user) : undefined,
});

export const getUserStats = (user, workouts) => {
  const userId = getId(user._id ?? user.id);
  const userWorkouts = workouts.filter((workout) => getId(workout.userId) === userId);
  const workoutDays = new Set(userWorkouts.map((workout) => new Date(workout.date).toISOString().slice(0, 10))).size;
  const totalMinutes = userWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
  const latestWeight = getLatestWeight(user);
  const totalCalories = userWorkouts.reduce((sum, workout) => sum + calculateCalories(workout.duration, latestWeight), 0);

  return {
    totalWorkouts: userWorkouts.length,
    totalWorkoutDays: workoutDays,
    totalWorkoutMinutes: totalMinutes,
    totalWorkoutHours: Number((totalMinutes / 60).toFixed(1)),
    totalCaloriesBurned: Number(totalCalories.toFixed(1)),
    bmi: calculateBmi(user.weight, user.height),
  };
};

export const getMonthlyStats = (user, workouts, now = new Date()) => {
  const { start, end } = getMonthRange(now);
  const filtered = workouts.filter(
    (workout) =>
      getId(workout.userId) === getId(user._id ?? user.id) &&
      new Date(workout.date) >= start &&
      new Date(workout.date) < end,
  );
  const workoutDays = new Set(filtered.map((workout) => new Date(workout.date).toISOString().slice(0, 10))).size;
  const totalMinutes = filtered.reduce((sum, workout) => sum + workout.duration, 0);
  const latestWeight = getLatestWeight(user);
  const totalCalories = filtered.reduce((sum, workout) => sum + calculateCalories(workout.duration, latestWeight), 0);

  return {
    totalWorkouts: filtered.length,
    totalWorkoutDays: workoutDays,
    totalWorkoutMinutes: totalMinutes,
    totalWorkoutHours: Number((totalMinutes / 60).toFixed(1)),
    totalCaloriesBurned: Number(totalCalories.toFixed(1)),
    bmi: calculateBmi(user.weight, user.height),
  };
};

export const getLeaderboardRows = (users, workouts, now = new Date()) => {
  const { start, end } = getMonthRange(now);
  const monthlyWorkouts = workouts.filter((workout) => new Date(workout.date) >= start && new Date(workout.date) < end);

  return users
    .map((user) => {
      const userWorkouts = monthlyWorkouts.filter((workout) => getId(workout.userId) === getId(user._id ?? user.id));
      const workoutDays = new Set(userWorkouts.map((workout) => new Date(workout.date).toISOString().slice(0, 10))).size;
      const totalMinutes = userWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
      const latestWeight = getLatestWeight(user);
      const totalCalories = userWorkouts.reduce((sum, workout) => sum + calculateCalories(workout.duration, latestWeight), 0);

      return {
        user,
        totalWorkoutDays: workoutDays,
        totalWorkoutMinutes: totalMinutes,
        totalWorkoutHours: Number((totalMinutes / 60).toFixed(1)),
        totalCaloriesBurned: Number(totalCalories.toFixed(1)),
      };
    })
    .sort(
      (a, b) =>
        b.totalWorkoutDays - a.totalWorkoutDays ||
        b.totalWorkoutMinutes - a.totalWorkoutMinutes ||
        b.totalCaloriesBurned - a.totalCaloriesBurned ||
        a.user.name.localeCompare(b.user.name),
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
};

export const getMostActiveUser = (users, workouts, now = new Date()) => {
  const rows = getLeaderboardRows(users, workouts, now);
  return rows[0] ? rows[0].user : null;
};
