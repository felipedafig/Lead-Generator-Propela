import express from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const router = express.Router();

// Predefined accounts — add or change users here
const USERS = [
  { id: 1, name: 'Delano', email: 'delano@test.com', password: 'delano123' },
  { id: 2, name: 'Felipe', email: 'felipe@test.com', password: 'delano123' },
];

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    logger.warn('Login failed: invalid credentials', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  logger.info('User logged in successfully', { email });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

export default router;
