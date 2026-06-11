import mongoose from 'mongoose';

const weightHistorySchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, required: true, min: 10, max: 100 },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    height: { type: Number, required: true, min: 120, max: 230 },
    weight: { type: Number, required: true, min: 30, max: 250 },
    weightHistory: { type: [weightHistorySchema], default: [] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
