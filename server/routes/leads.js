import express from 'express';
import ExcelJS from 'exceljs';
import { getDatabase } from '../db.js';

const router = express.Router();

// Get all leads for user
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { industry, status, search } = req.query;

    let query = 'SELECT * FROM leads WHERE user_id = ?';
    let params = [req.user.id];

    if (industry) {
      query += ' AND industry = ?';
      params.push(industry);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (company_name LIKE ? OR phone_number LIKE ? OR owner_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const leads = await db.all(query, params);
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const lead = await db.get(
      'SELECT * FROM leads WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { company_name, owner_name, phone_number, email, address, city, industry, review_count, rating, google_maps_url, notes } = req.body;

    const result = await db.run(
      `INSERT INTO leads (user_id, company_name, owner_name, phone_number, email, address, city, industry, review_count, rating, google_maps_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, company_name, owner_name, phone_number, email, address, city, industry, review_count, rating, google_maps_url, notes]
    );

    const lead = await db.get('SELECT * FROM leads WHERE id = ?', [result.lastID]);
    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { company_name, owner_name, phone_number, email, address, city, industry, review_count, rating, status, notes } = req.body;

    await db.run(
      `UPDATE leads SET company_name = ?, owner_name = ?, phone_number = ?, email = ?, address = ?, city = ?, industry = ?, review_count = ?, rating = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [company_name, owner_name, phone_number, email, address, city, industry, review_count, rating, status, notes, req.params.id, req.user.id]
    );

    const lead = await db.get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    await db.run('DELETE FROM leads WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Export to XLSX
router.get('/export/xlsx', async (req, res) => {
  try {
    const db = getDatabase();
    const { industry } = req.query;

    let query = 'SELECT * FROM leads WHERE user_id = ?';
    let params = [req.user.id];

    if (industry) {
      query += ' AND industry = ?';
      params.push(industry);
    }

    query += ' ORDER BY created_at DESC';

    const leads = await db.all(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    // Add headers
    worksheet.columns = [
      { header: 'Company Name', key: 'company_name', width: 25 },
      { header: 'Owner Name', key: 'owner_name', width: 20 },
      { header: 'Phone Number', key: 'phone_number', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Industry', key: 'industry', width: 15 },
      { header: 'Review Count', key: 'review_count', width: 12 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created At', key: 'created_at', width: 15 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

    // Add data
    leads.forEach(lead => {
      worksheet.addRow(lead);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="propela-leads.xlsx"');

    await workbook.xlsx.write(res);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export leads' });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const db = getDatabase();

    const stats = await db.get(`
      SELECT
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
        AVG(CAST(review_count AS FLOAT)) as avg_reviews
      FROM leads
      WHERE user_id = ?
    `, [req.user.id]);

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
