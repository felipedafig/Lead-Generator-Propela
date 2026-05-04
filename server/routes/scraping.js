import express from 'express';
import { getDatabase } from '../db.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get scraping tasks for user
router.get('/tasks', async (req, res) => {
  try {
    const db = getDatabase();
    const [tasks] = await db.query(
      'SELECT * FROM scraping_tasks WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(tasks);
  } catch (error) {
    logger.error('Get tasks error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new scraping task
router.post('/tasks', async (req, res) => {
  try {
    const db = getDatabase();
    const { city, industry, min_reviews } = req.body;

    if (!city || !industry) {
      return res.status(400).json({ error: 'City and industry required' });
    }

    const [result] = await db.query(
      `INSERT INTO scraping_tasks (user_id, city, industry, min_reviews)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, city, industry, min_reviews || 3]
    );

    const [tasks] = await db.query('SELECT * FROM scraping_tasks WHERE id = ?', [result.insertId]);
    const task = tasks[0];

    res.status(201).json(task);
    logger.info('Scraping task created', { taskId: task.id, city, industry });
  } catch (error) {
    logger.error('Create task error:', { error: error.message });
    res.status(500).json({ error: 'Failed to create scraping task' });
  }
});

// Get task details
router.get('/tasks/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const [tasks] = await db.query(
      'SELECT * FROM scraping_tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(tasks[0]);
  } catch (error) {
    logger.error('Get task error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

export default router;
