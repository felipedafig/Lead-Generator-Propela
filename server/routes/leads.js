import express from 'express';
import ExcelJS from 'exceljs';
import { getDatabase } from '../db.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to determine company size tier
function getCompanySizeTier(industry, employeeCount) {
  if (!employeeCount) {
    // Generate random employee count if not provided
    if (industry === 'hotel') {
      employeeCount = Math.floor(Math.random() * 450) + 1; // 1-500
    } else if (industry === 'property manager') {
      employeeCount = Math.floor(Math.random() * 499) + 1; // 1-500 (property count)
    } else {
      employeeCount = Math.floor(Math.random() * 500) + 1;
    }
  }

  if (industry === 'hotel') {
    if (employeeCount <= 10) return 'micro';
    if (employeeCount <= 50) return 'boutique-small';
    if (employeeCount <= 200) return 'boutique-mid';
    return 'mid-chain';
  } else if (industry === 'property manager') {
    if (employeeCount === 1) return 'solo';
    if (employeeCount <= 10) return 'small-portfolio';
    return 'large-portfolio';
  }

  return null;
}

// Import leads from JSON file
router.post('/import', async (req, res) => {
  try {
    const db = getDatabase();
    const leads = Array.isArray(req.body) ? req.body : [req.body];

    if (leads.length === 0) {
      return res.status(400).json({ error: 'No leads provided' });
    }

    let imported = 0;
    let skipped = 0;

    for (const lead of leads) {
      try {
        // Extract country and city from location if needed
        let city = lead.city || (lead.location ? lead.location.split(',')[0].trim() : '');
        let country = lead.country || (lead.location ? lead.location.split(',')[1].trim() : '');
        let industry = lead.industry || 'hotel';
        let employeeCount = lead.employeeCount || lead.employee_count || null;
        let companySizeTier = getCompanySizeTier(industry, employeeCount);

        // Generate employee count if not provided
        if (!employeeCount) {
          if (industry === 'hotel') {
            employeeCount = Math.floor(Math.random() * 450) + 1;
          } else if (industry === 'property manager') {
            employeeCount = Math.floor(Math.random() * 499) + 1;
          }
        }

        const [result] = await db.execute(
          `INSERT INTO leads
           (user_id, company_name, owner_name, phone_number, email, city, country, industry, employee_count, company_size, review_count, rating, vibe_id, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            lead.company || lead.company_name || lead.name,
            lead.name || lead.owner_name,
            lead.phone || lead.phone_number || null,
            lead.email || null,
            city,
            country,
            industry,
            employeeCount,
            companySizeTier,
            lead.reviewCount || lead.review_count || 0,
            lead.rating || 0,
            lead.id || lead.vibe_id || null,
            lead.notes || `Imported lead - ${lead.title || 'Contact'}`
          ]
        );

        imported++;
      } catch (error) {
        // Skip duplicate entries or other non-critical errors
        if (error.code === 'ER_DUP_ENTRY') {
          skipped++;
        } else {
          logger.warn(`Skipped lead import: ${lead.company || lead.name}`, { error: error.message });
          skipped++;
        }
      }
    }

    logger.info('Leads imported', {
      userId: req.user.id,
      imported,
      skipped,
      total: leads.length
    });

    res.json({
      success: true,
      imported,
      skipped,
      total: leads.length,
      message: `Imported ${imported} leads, skipped ${skipped}`
    });
  } catch (error) {
    logger.error('Import leads error', {
      userId: req.user.id,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to import leads',
      details: error.message
    });
  }
});

// Get all leads for user (with optional city/country/industry/company_size search)
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { city, country, industry, company_size, status, search } = req.query;

    let query = 'SELECT * FROM leads WHERE user_id = ?';
    let params = [req.user.id];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }

    if (industry) {
      query += ' AND industry = ?';
      params.push(industry);
    }

    if (company_size) {
      query += ' AND company_size = ?';
      params.push(company_size);
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

    const [leads] = await db.execute(query, params);
    res.json(leads);
  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const [leads] = await db.execute(
      'SELECT * FROM leads WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(leads[0]);
  } catch (error) {
    logger.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { company_name, owner_name, phone_number, email, website_url, address, city, country, industry, review_count, rating, google_maps_url, notes } = req.body;

    const [result] = await db.execute(
      `INSERT INTO leads (user_id, company_name, owner_name, phone_number, email, website_url, address, city, country, industry, review_count, rating, google_maps_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, company_name, owner_name || null, phone_number || null, email || null, website_url || null, address || null, city, country || null, industry, review_count || 0, rating || 0, google_maps_url || null, notes || null]
    );

    const [lead] = await db.execute('SELECT * FROM leads WHERE id = ?', [result.insertId]);
    res.status(201).json(lead[0]);
  } catch (error) {
    logger.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead (supports partial updates)
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const allowedFields = ['company_name', 'owner_name', 'phone_number', 'email', 'website_url', 'address', 'city', 'country', 'industry', 'review_count', 'rating', 'status', 'email_sent', 'email_sent_date', 'called', 'called_date', 'notes'];

    // Build dynamic UPDATE query based on provided fields
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        updates.push(`${field} = ?`);
        let value = req.body[field];
        // Handle special cases
        if (field === 'review_count' && value === undefined) value = 0;
        if (field === 'rating' && value === undefined) value = 0;
        if (field === 'status' && value === undefined) value = 'new';
        values.push(value !== undefined ? value : null);
      }
    }

    if (updates.length === 0) {
      const [lead] = await db.execute('SELECT * FROM leads WHERE id = ?', [req.params.id]);
      return res.json(lead[0]);
    }

    values.push(req.params.id);
    values.push(req.user.id);

    const query = `UPDATE leads SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    await db.execute(query, values);

    const [lead] = await db.execute('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    res.json(lead[0]);
  } catch (error) {
    logger.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    await db.execute('DELETE FROM leads WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete lead error:', error);
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

    const [leads] = await db.execute(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    // Add headers
    worksheet.columns = [
      { header: 'Company Name', key: 'company_name', width: 25 },
      { header: 'Owner Name', key: 'owner_name', width: 20 },
      { header: 'Phone Number', key: 'phone_number', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Website', key: 'website_url', width: 30 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Industry', key: 'industry', width: 15 },
      { header: 'Review Count', key: 'review_count', width: 12 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Email Sent', key: 'email_sent', width: 12 },
      { header: 'Email Sent Date', key: 'email_sent_date', width: 15 },
      { header: 'Called', key: 'called', width: 12 },
      { header: 'Called Date', key: 'called_date', width: 15 },
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

    const [stats] = await db.execute(`
      SELECT
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
        AVG(review_count) as avg_reviews
      FROM leads
      WHERE user_id = ?
    `, [req.user.id]);

    res.json(stats[0]);
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
