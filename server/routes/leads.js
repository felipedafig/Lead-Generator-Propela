import express from 'express';
import ExcelJS from 'exceljs';
import { getDatabase } from '../db.js';
import logger from '../utils/logger.js';

const router = express.Router();

const VALID_LEAD_TYPES = new Set(['hotels', 'website-design']);

function getLeadType(req) {
  const fromHeader = req.headers['x-lead-type'];
  const fromQuery = req.query.lead_type;
  const fromBody = req.body?.lead_type;
  const candidate = fromHeader || fromQuery || fromBody || 'hotels';
  return VALID_LEAD_TYPES.has(candidate) ? candidate : 'hotels';
}

// Helper function to determine company size tier (hotels environment only)
function getCompanySizeTier(industry, employeeCount) {
  if (!employeeCount) {
    if (industry === 'hotel') {
      employeeCount = Math.floor(Math.random() * 450) + 1;
    } else if (industry === 'property manager') {
      employeeCount = Math.floor(Math.random() * 499) + 1;
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
    const leadType = getLeadType(req);
    const leads = Array.isArray(req.body) ? req.body : [req.body];

    if (leads.length === 0) {
      return res.status(400).json({ error: 'No leads provided' });
    }

    const truncate = (v, n) => {
      if (v == null) return null;
      const s = String(v).trim();
      if (!s) return null;
      return s.length > n ? s.substring(0, n) : s;
    };
    const toInt = (v) => {
      if (v == null || v === '') return null;
      const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
      return Number.isFinite(n) ? n : null;
    };
    const toFloat = (v) => {
      if (v == null || v === '') return null;
      const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
      return Number.isFinite(n) ? n : null;
    };
    const normalizePhone = (v) => v ? String(v).replace(/\D/g, '') : '';

    // Pre-load phone numbers already in this environment so we can dedup imports.
    const [existingRows] = await db.execute(
      `SELECT phone_number FROM leads
       WHERE lead_type = ? AND phone_number IS NOT NULL AND phone_number <> ''`,
      [leadType]
    );
    const existingPhones = new Set(
      existingRows
        .map(r => normalizePhone(r.phone_number))
        .filter(Boolean)
    );

    let imported = 0;
    let skipped = 0;
    const failures = [];

    for (const lead of leads) {
      try {
        const phone = truncate(lead.phone || lead.phone_number, 64);
        const email = truncate(lead.email, 255);

        // Skip duplicates by phone (digits-only match, scoped to this environment).
        // This also catches duplicates within the same import batch.
        const phoneKey = normalizePhone(phone);
        if (phoneKey && existingPhones.has(phoneKey)) {
          skipped++;
          failures.push({
            company: lead.company || lead.company_name || lead.name || phone,
            code: 'DUPLICATE_PHONE',
            message: `Phone already exists: ${phone}`
          });
          continue;
        }

        let city = truncate(lead.city || (lead.location ? lead.location.split(',')[0] : null), 100);
        let country = truncate(lead.country || (lead.location ? lead.location.split(',').slice(1).join(',') : null), 100);
        let industry = truncate(lead.industry, 100) || (leadType === 'hotels' ? 'hotel' : null);

        // Fall back through every plausible identifier so company_name is never null.
        const companyName = truncate(
          lead.company || lead.company_name || lead.name || lead.business_name
            || email || phone || 'Unknown Lead',
          255
        );

        let employeeCount = toInt(lead.employeeCount || lead.employee_count);
        let companySizeTier = leadType === 'hotels'
          ? getCompanySizeTier(industry, employeeCount)
          : null;

        if (leadType === 'hotels' && !employeeCount) {
          if (industry === 'hotel') {
            employeeCount = Math.floor(Math.random() * 450) + 1;
          } else if (industry === 'property manager') {
            employeeCount = Math.floor(Math.random() * 499) + 1;
          }
        }

        const reviewCount = toInt(lead.reviewCount || lead.review_count) ?? 0;
        const rating = toFloat(lead.rating) ?? 0;

        await db.execute(
          `INSERT INTO leads
           (user_id, company_name, owner_name, phone_number, email, website_url, address, city, country, industry, employee_count, company_size, review_count, rating, vibe_id, notes, lead_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            companyName,
            truncate(lead.name || lead.owner_name, 255),
            phone,
            email,
            truncate(lead.website || lead.website_url, 65535),
            truncate(lead.address, 255),
            city,
            country,
            industry,
            employeeCount,
            companySizeTier,
            reviewCount,
            rating,
            truncate(lead.id || lead.vibe_id, 255),
            lead.notes ? String(lead.notes) : `Imported lead - ${lead.title || companyName}`,
            leadType
          ]
        );

        if (phoneKey) existingPhones.add(phoneKey);
        imported++;
      } catch (error) {
        skipped++;
        failures.push({
          company: lead.company || lead.company_name || lead.name || '(unknown)',
          code: error.code,
          message: error.message
        });
        logger.warn('Skipped lead import', {
          company: lead.company || lead.company_name || lead.name,
          code: error.code,
          error: error.message
        });
      }
    }

    logger.info('Leads imported', {
      userId: req.user.id,
      leadType,
      imported,
      skipped,
      total: leads.length,
      failures: failures.slice(0, 10)
    });

    res.json({
      success: true,
      imported,
      skipped,
      total: leads.length,
      failures: failures.slice(0, 10),
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

// Lead Discovery — return all matching leads and ensure they're claimed by the user
router.post('/discover', async (req, res) => {
  try {
    const db = getDatabase();
    const leadType = getLeadType(req);
    const { country, city, industry, company_size } = req.body;

    let where = 'lead_type = ?';
    const params = [leadType];

    if (country) { where += ' AND country = ?'; params.push(country); }
    if (city)    { where += ' AND city = ?';    params.push(city); }
    if (industry){ where += ' AND industry = ?';params.push(industry); }
    if (company_size) { where += ' AND company_size = ?'; params.push(company_size); }

    const [matches] = await db.execute(`SELECT * FROM leads WHERE ${where}`, params);

    // Claim any rows that aren't already owned by the requesting user. Rows the
    // user already owns are skipped — re-running the same search is idempotent
    // and never duplicates a lead in the user's My Leads.
    if (matches.length > 0) {
      const toClaim = matches
        .filter(m => !(m.claimed === 1 && m.user_id === req.user.id))
        .map(m => m.id);

      if (toClaim.length > 0) {
        const placeholders = toClaim.map(() => '?').join(',');
        await db.execute(
          `UPDATE leads SET claimed = 1, user_id = ? WHERE id IN (${placeholders})`,
          [req.user.id, ...toClaim]
        );
      }
    }

    // Return the results as they now appear (claimed by current user) so the UI
    // gets a consistent view regardless of how many times the search ran.
    const newlyClaimed = matches.length;
    const alreadyOwned = matches.filter(m => m.claimed === 1 && m.user_id === req.user.id).length;
    const claimedNow = newlyClaimed - alreadyOwned;

    const normalized = matches.map(m => ({
      ...m,
      claimed: 1,
      user_id: req.user.id
    }));

    res.json({
      success: true,
      results: normalized,
      totalFound: normalized.length,
      newlyAdded: claimedNow,
      alreadyOwned
    });
  } catch (error) {
    logger.error('Discover error:', { error: error.message });
    res.status(500).json({ error: 'Failed to discover leads' });
  }
});

// Get all leads for user (with optional city/country/industry/company_size search)
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const leadType = getLeadType(req);
    const { city, country, industry, company_size, status, search, tracking } = req.query;

    let query = 'SELECT * FROM leads WHERE user_id = ? AND claimed = 1 AND lead_type = ?';
    let params = [req.user.id, leadType];

    if (tracking === 'true') {
      query += ' AND (email_sent = 1 OR called = 1)';
    } else if (tracking === 'false') {
      query += ' AND email_sent = 0 AND called = 0';
    }

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
    const leadType = getLeadType(req);
    const { company_name, owner_name, phone_number, email, website_url, address, city, country, industry, review_count, rating, google_maps_url, notes } = req.body;

    const [result] = await db.execute(
      `INSERT INTO leads (user_id, company_name, owner_name, phone_number, email, website_url, address, city, country, industry, review_count, rating, google_maps_url, notes, lead_type, claimed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [req.user.id, company_name, owner_name || null, phone_number || null, email || null, website_url || null, address || null, city, country || null, industry, review_count || 0, rating || 0, google_maps_url || null, notes || null, leadType]
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

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        updates.push(`${field} = ?`);
        let value = req.body[field];
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
    const [result] = await db.execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
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
    const leadType = getLeadType(req);
    const { industry } = req.query;

    let query = 'SELECT * FROM leads WHERE user_id = ? AND lead_type = ?';
    let params = [req.user.id, leadType];

    if (industry) {
      query += ' AND industry = ?';
      params.push(industry);
    }

    query += ' ORDER BY created_at DESC';

    const [leads] = await db.execute(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

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

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

    leads.forEach(lead => {
      worksheet.addRow(lead);
    });

    const filename = leadType === 'website-design' ? 'propela-webdesign-leads.xlsx' : 'propela-hotels-leads.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

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
    const leadType = getLeadType(req);

    const [stats] = await db.execute(`
      SELECT
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
        AVG(review_count) as avg_reviews
      FROM leads
      WHERE user_id = ? AND lead_type = ?
    `, [req.user.id, leadType]);

    res.json(stats[0]);
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Tracker-focused dashboard stats
router.get('/stats/tracker', async (req, res) => {
  try {
    const db = getDatabase();
    const leadType = getLeadType(req);
    const userId = req.user.id;

    const [totalRows] = await db.execute(
      `SELECT COUNT(*) AS total_tracked FROM leads
       WHERE user_id = ? AND claimed = 1 AND lead_type = ? AND (email_sent = 1 OR called = 1)`,
      [userId, leadType]
    );

    const [statusRows] = await db.execute(
      `SELECT COALESCE(status, 'new') AS status, COUNT(*) AS count
       FROM leads
       WHERE user_id = ? AND claimed = 1 AND lead_type = ? AND (email_sent = 1 OR called = 1)
       GROUP BY status`,
      [userId, leadType]
    );

    const [emailRows] = await db.execute(
      `SELECT email_sent_date AS date, COUNT(*) AS count
       FROM leads
       WHERE user_id = ? AND claimed = 1 AND lead_type = ? AND email_sent = 1 AND email_sent_date IS NOT NULL
       GROUP BY email_sent_date
       ORDER BY email_sent_date`,
      [userId, leadType]
    );

    const [callRows] = await db.execute(
      `SELECT called_date AS date, COUNT(*) AS count
       FROM leads
       WHERE user_id = ? AND claimed = 1 AND lead_type = ? AND called = 1 AND called_date IS NOT NULL
       GROUP BY called_date
       ORDER BY called_date`,
      [userId, leadType]
    );

    res.json({
      total_tracked: Number(totalRows[0]?.total_tracked || 0),
      status_distribution: statusRows.map(r => ({ status: r.status, count: Number(r.count) })),
      emails_over_time: emailRows.map(r => ({ date: r.date, count: Number(r.count) })),
      calls_over_time: callRows.map(r => ({ date: r.date, count: Number(r.count) }))
    });
  } catch (error) {
    logger.error('Tracker stats error:', error);
    res.status(500).json({ error: 'Failed to fetch tracker statistics' });
  }
});

export default router;
