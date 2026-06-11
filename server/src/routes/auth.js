import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRequired } from '../middleware/auth.js';
import { serializeUser } from '../utils/stats.js';
import { createUser, findUserByEmail } from '../store.js';

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, age, gender, height, weight } = req.body;

    if (!name || !email || !password || !age || !gender || !height || !weight) {
      return res.status(400).json({ message: 'All profile fields are required.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email: email.toLowerCase(),
      password: hashed,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      weightHistory: [{ weight: Number(weight), date: new Date() }],
      role: 'user',
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email || '');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    return res.json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authRequired, async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

export default router;
