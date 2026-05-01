import express from 'express';
import axios from 'axios';
import { getDatabase } from '../db.js';
import { scrapeGoogleMaps } from '../services/scraper.js';

const router = express.Router();

// Get scraping tasks for user
router.get('/tasks', async (req, res) => {
  try {
    const db = getDatabase();
    const tasks = await db.all(
      'SELECT * FROM scraping_tasks WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
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

    const result = await db.run(
      `INSERT INTO scraping_tasks (user_id, city, industry, min_reviews)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, city, industry, min_reviews || 3]
    );

    const task = await db.get('SELECT * FROM scraping_tasks WHERE id = ?', [result.lastID]);

    // Start scraping in background
    processScrapingTask(task, req.user.id).catch(console.error);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create scraping task' });
  }
});

// Get task details
router.get('/tasks/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const task = await db.get(
      'SELECT * FROM scraping_tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

async function processScrapingTask(task, userId) {
  const db = getDatabase();

  try {
    // Update task status to processing
    await db.run('UPDATE scraping_tasks SET status = ? WHERE id = ?', ['processing', task.id]);

    // Perform scraping
    const leads = await scrapeGoogleMaps(task.city, task.industry, task.min_reviews);

    // Insert leads into database
    for (const lead of leads) {
      await db.run(
        `INSERT INTO leads (user_id, company_name, owner_name, phone_number, email, address, city, industry, review_count, rating, google_maps_url, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          lead.company_name,
          lead.owner_name,
          lead.phone_number,
          lead.email,
          lead.address,
          task.city,
          task.industry,
          lead.review_count,
          lead.rating,
          lead.google_maps_url,
          `Scraped from ${task.city} on ${new Date().toLocaleDateString()}`
        ]
      );
    }

    // Update task as completed
    await db.run(
      'UPDATE scraping_tasks SET status = ?, total_leads = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['completed', leads.length, task.id]
    );

    console.log(`✅ Completed scraping task ${task.id}: ${leads.length} leads found`);
  } catch (error) {
    console.error(`❌ Scraping task ${task.id} failed:`, error);
    await db.run('UPDATE scraping_tasks SET status = ? WHERE id = ?', ['failed', task.id]);
  }
}

export default router;
