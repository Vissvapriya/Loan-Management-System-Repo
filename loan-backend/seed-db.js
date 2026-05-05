const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'loan_management_db',
  password: 'root',
  port: 5432,
});

const seed = async () => {
  try {
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM loans');
    await pool.query('DELETE FROM users');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE loans_id_seq RESTART WITH 1');

    const salt = await bcrypt.genSalt(10);
    const pass1 = await bcrypt.hash('password123', salt);

    console.log('Inserting mock users...');
    const ownerRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      ['System Owner', 'owner@bank.com', pass1, 'owner']
    );

    const c1Res = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      ['Arun Kumar', 'arun@gmail.com', pass1, 'customer']
    );
    const c1Id = c1Res.rows[0].id;

    const c2Res = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      ['Priya Sharma', 'priya@gmail.com', pass1, 'customer']
    );
    const c2Id = c2Res.rows[0].id;

    console.log('Inserting mock loans...');
    await pool.query(
      `INSERT INTO loans (amount, purpose, age, phone, income, cibil, collateral, employment, bank, account, interest, duration, emi, status, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [500000, 'Home Loan', 35, '9876543210', 80000, 780, 'Property', 'Salaried', 'SBI Bank', 'XXXX1234', 8.5, '5 Years', 10234, 'approved', c1Id]
    );

    await pool.query(
      `INSERT INTO loans (amount, purpose, age, phone, income, cibil, collateral, employment, status, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [200000, 'Personal Loan', 28, '9123456780', 45000, 720, 'None', 'Business', 'pending', c2Id]
    );

    await pool.query(
      `INSERT INTO loans (amount, purpose, age, phone, income, cibil, collateral, employment, status, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [300000, 'Vehicle Loan', 32, '9888777666', 60000, 650, 'Car Papers', 'Salaried', 'rejected', c1Id]
    );

    console.log('Database successfully seeded with realistic live data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
