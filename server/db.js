import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db;

export async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, '../propela.db'),
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Leads table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      owner_name TEXT,
      phone_number TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      industry TEXT,
      review_count INTEGER,
      rating REAL,
      google_maps_url TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Scraping tasks table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS scraping_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      city TEXT NOT NULL,
      industry TEXT NOT NULL,
      min_reviews INTEGER DEFAULT 3,
      status TEXT DEFAULT 'pending',
      total_leads INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Database initialized successfully');
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
