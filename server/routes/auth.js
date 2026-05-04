import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const hashedPassword = await bcryptjs.hash(password, 10);

    try {
      const [result] = await db.execute(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name]
      );

      const [users] = await db.execute(
        'SELECT id, email, name FROM users WHERE id = ?',
        [result.insertId]
      );

      const user = users[0];

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      logger.info('User registered successfully', { email });
      res.json({ token, user });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Register error:', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = getDatabase();
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      logger.warn('Login failed: user not found', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcryptjs.compare(password, user.password);

    if (!validPassword) {
      logger.warn('Login failed: invalid password', { email });
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    logger.error('Login error:', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
