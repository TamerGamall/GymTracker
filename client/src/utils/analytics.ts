import type { Workout } from '../types';

export const getWorkoutTypeFrequency = (workouts: Workout[]) => {
  const counts = new Map<string, number>();
  workouts.forEach((workout) => {
    counts.set(workout.type, (counts.get(workout.type) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
};

export const getMonthlyHoursSeries = (workouts: Workout[]) => {
  const months = new Map<string, number>();
  const now = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - offset);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.set(key, 0);
  }

  workouts.forEach((workout) => {
    const date = new Date(workout.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (months.has(key)) {
      months.set(key, (months.get(key) ?? 0) + workout.duration / 60);
    }
  });

  return [...months.entries()].map(([month, hours]) => ({
    month,
    hours: Number(hours.toFixed(1)),
  }));
};

export const getCaloriesTrend = (workouts: Workout[]) =>
  [...workouts]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
    .map((workout, index) => ({
      label: `${index + 1}`,
      calories: workout.calories,
    }));
