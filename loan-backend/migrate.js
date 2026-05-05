const { Client } = require('pg');
require('dotenv').config();

const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_PORT = process.env.DB_PORT || 5432;

async function migrate() {
  const client = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: 'loan_management_db',
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  try {
    await client.connect();
    console.log('Running migrations...');

    // 1. Add rejection_reason column to loans table
    await client.query(`
      ALTER TABLE loans 
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
      ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS disbursed_date TIMESTAMP
    `);
    console.log('✓ Added rejection_reason and date columns to loans table');

    // 2. Create loan_schemes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loan_schemes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        max_amount DECIMAL(12,2) NOT NULL,
        min_amount DECIMAL(12,2) DEFAULT 10000,
        duration VARCHAR(50) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created loan_schemes table');

    // 3. Add scheme_id to loans table
    await client.query(`
      ALTER TABLE loans 
      ADD COLUMN IF NOT EXISTS scheme_id INT REFERENCES loan_schemes(id)
    `);
    console.log('✓ Added scheme_id to loans table');

    // 4. Add file upload columns to loans table
    await client.query(`
      ALTER TABLE loans 
      ADD COLUMN IF NOT EXISTS id_proof VARCHAR(255),
      ADD COLUMN IF NOT EXISTS income_proof VARCHAR(255),
      ADD COLUMN IF NOT EXISTS address_proof VARCHAR(255)
    `);
    console.log('✓ Added document columns to loans table');

    // 5. Insert default loan schemes
    const schemesExist = await client.query('SELECT COUNT(*) FROM loan_schemes');
    if (parseInt(schemesExist.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO loan_schemes (name, interest_rate, max_amount, min_amount, duration, description) VALUES
        ('Home Loan', 8.5, 5000000, 100000, '20 Years', 'Low interest rate for purchasing or constructing a home'),
        ('Car Loan', 9.0, 1000000, 50000, '7 Years', 'Finance your dream car with flexible EMI options'),
        ('Personal Loan', 11.0, 500000, 10000, '5 Years', 'Quick approval for personal needs with minimal documentation'),
        ('Education Loan', 7.5, 2000000, 50000, '10 Years', 'Invest in your future with our education loan')
      `);
      console.log('✓ Inserted default loan schemes');
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
