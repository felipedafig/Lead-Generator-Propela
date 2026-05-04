import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function seedUsers() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'propela_user',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'propela'
    });

    const connection = await pool.getConnection();

    const users = [
      { name: 'Delano', email: 'delano@test.com', password: 'delano123' },
      { name: 'Felipe', email: 'felipe@test.com', password: 'delano123' }
    ];

    for (const user of users) {
      const hashedPassword = await bcryptjs.hash(user.password, 10);

      try {
        await connection.execute(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [user.name, user.email, hashedPassword]
        );
        console.log(`✅ User created: ${user.email}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  User already exists: ${user.email}`);
        } else {
          throw error;
        }
      }
    }

    connection.release();
    pool.end();
    console.log('\n✅ Seeding completed!');
    console.log('\nYou can now login with:');
    console.log('  Email: delano@test.com');
    console.log('  Password: delano123');
    console.log('\nOr:');
    console.log('  Email: felipe@test.com');
    console.log('  Password: delano123');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedUsers();
