const { Client } = require('pg');
require('dotenv').config();

const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_PORT = process.env.DB_PORT || 5432;

async function initializeDatabase() {
  const defaultClient = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: 'postgres',
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  try {
    await defaultClient.connect();
    const res = await defaultClient.query("SELECT datname FROM pg_catalog.pg_database WHERE datname = 'loan_management_db'");
    
    if (res.rowCount === 0) {
      console.log('Database not found, creating loan_management_db...');
      await defaultClient.query('CREATE DATABASE loan_management_db');
      console.log('Database created!');
    } else {
      console.log('Database loan_management_db already exists.');
    }
  } catch (err) {
    console.error('Error with database creation:', err.message);
  } finally {
    await defaultClient.end();
  }

  const appClient = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: 'loan_management_db',
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  try {
    await appClient.connect();
    console.log('Creating tables if they do not exist...');

    // Drop any existing tables to start fresh
    await appClient.query('DROP TABLE IF EXISTS orders CASCADE');
    await appClient.query('DROP TABLE IF EXISTS order_item CASCADE');
    await appClient.query('DROP TABLE IF EXISTS product CASCADE');
    await appClient.query('DROP TABLE IF EXISTS loans CASCADE');
    await appClient.query('DROP TABLE IF EXISTS users CASCADE');

    await appClient.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await appClient.query(`
      CREATE TABLE loans (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(12,2) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        age INT,
        phone VARCHAR(20),
        income DECIMAL(12,2),
        cibil INT,
        collateral VARCHAR(255),
        employment VARCHAR(50),
        bank VARCHAR(100),
        account VARCHAR(50),
        interest DECIMAL(5,2),
        duration VARCHAR(50),
        emi DECIMAL(12,2),
        status VARCHAR(20) DEFAULT 'pending',
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  } finally {
    await appClient.end();
  }
}

initializeDatabase();
