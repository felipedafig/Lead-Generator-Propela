import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export async function initializeDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'propela',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255),
        phone_number VARCHAR(20),
        email VARCHAR(255),
        website_url TEXT,
        address VARCHAR(255),
        city VARCHAR(100),
        country VARCHAR(100),
        industry VARCHAR(100),
        employee_count INT,
        company_size VARCHAR(100),
        review_count INT,
        rating DECIMAL(3,2),
        google_maps_url TEXT,
        vibe_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'new',
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_date DATE,
        called BOOLEAN DEFAULT FALSE,
        called_date DATE,
        notes LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_city (city),
        INDEX idx_country (country),
        INDEX idx_industry (industry),
        INDEX idx_company_size (company_size)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS lead_cache (
        id INT PRIMARY KEY AUTO_INCREMENT,
        query_hash VARCHAR(64) UNIQUE NOT NULL,
        results LONGTEXT NOT NULL,
        cost_estimate DECIMAL(10,4),
        ttl_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS scraping_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100),
        industry VARCHAR(100) NOT NULL,
        min_reviews INT DEFAULT 3,
        status VARCHAR(50) DEFAULT 'pending',
        total_leads INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    await seedDefaultUsers(connection);

    connection.release();
    console.log('✅ MySQL Database initialized successfully');
    return pool;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function seedDefaultUsers(connection) {
  const users = [
    { name: 'Delano', email: 'delano@test.com', password: 'delano123' },
    { name: 'Felipe', email: 'felipe@test.com', password: 'delano123' }
  ];

  for (const user of users) {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [user.email]);
    if (existing.length === 0) {
      const hashed = await bcryptjs.hash(user.password, 10);
      await connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [user.name, user.email, hashed]);
      console.log(`✅ Default user created: ${user.email}`);
    }
  }
}

export function getDatabase() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}
