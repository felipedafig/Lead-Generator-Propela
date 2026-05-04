import { getDatabase } from '../server/db.js';
import fs from 'fs';
import path from 'path';

const USER_ID = 1; // Default user for database leads

async function importLeads(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const leads = JSON.parse(fileContent);

    if (!Array.isArray(leads)) {
      throw new Error('JSON must be an array of leads');
    }

    const db = getDatabase();
    let imported = 0;
    let skipped = 0;

    for (const lead of leads) {
      try {
        // Extract country and city from location
        const [city, country] = lead.location.split(', ').reverse();

        const [result] = await db.execute(
          `INSERT INTO leads
           (user_id, company_name, owner_name, phone_number, email, city, country, industry, review_count, rating, vibe_id, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            USER_ID,
            lead.company || lead.name,
            lead.name,
            lead.phone || null,
            lead.email || null,
            city,
            country,
            lead.industry || 'hotel',
            lead.reviewCount || 0,
            lead.rating || 0,
            lead.id,
            `Imported from database - ${lead.title || 'Contact'}`
          ]
        );

        imported++;
      } catch (error) {
        console.warn(`Skipped lead: ${lead.company || lead.name} -`, error.message);
        skipped++;
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/import-leads.js <path-to-json-file>');
  process.exit(1);
}

importLeads(filePath);
