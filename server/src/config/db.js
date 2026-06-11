import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const uri = process.env.MONGO_URL || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URL is required');
  }

  await mongoose.connect(uri);
  return { source: 'mongo' };
};

export const stopDatabase = async () => {
  await mongoose.disconnect();
};
