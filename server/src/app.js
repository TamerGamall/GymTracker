import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import workoutRoutes from './routes/workouts.js';
import leaderboardRoutes from './routes/leaderboard.js';
import adminRoutes from './routes/admin.js';
import dashboardRoutes from './routes/dashboard.js';
import { errorHandler, notFound } from './middleware/error.js';

export const createApp = () => {
  const app = express();
  const clientDistPath = path.resolve(process.cwd(), 'dist');
  const clientBuildExists = fs.existsSync(clientDistPath);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  if (clientBuildExists) {
    app.use(express.static(clientDistPath));

    app.get(/^\/(?!api).*/, (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
