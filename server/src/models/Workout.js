import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    duration: { type: Number, required: true, min: 1 },
    calories: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const Workout = mongoose.model('Workout', workoutSchema);
