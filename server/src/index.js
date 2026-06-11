import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { getStoreMode, setMemoryStore, setMongoStore } from './store.js';

const port = Number(process.env.PORT || 5050);

const start = async () => {
  try {
    await connectDatabase();
    setMongoStore();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('MongoDB unavailable, starting with empty in-memory data.');
    setMemoryStore({ users: [], workouts: [] });
  }

  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Gym Friends Tracker API running on http://localhost:${port} (${getStoreMode()} store)`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
