const pool = require('../config/db');

// @desc    Apply for a new loan
// @route   POST /api/loans
// @access  Private (Customer)
const applyForLoan = async (req, res) => {
  try {
    const { amount, purpose, age, phone, income, cibil, collateral, employment, scheme_id } = req.body;
    const userId = req.user.id;

    if (!amount || !purpose) {
      return res.status(400).json({ error: 'Please provide amount and purpose' });
    }

    // Get file paths if uploaded
    const id_proof = req.files?.id_proof ? req.files.id_proof[0].path : null;
    const income_proof = req.files?.income_proof ? req.files.income_proof[0].path : null;
    const address_proof = req.files?.address_proof ? req.files.address_proof[0].path : null;

    const newLoan = await pool.query(
      `INSERT INTO loans (amount, purpose, age, phone, income, cibil, collateral, employment, scheme_id, id_proof, income_proof, address_proof, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [amount, purpose, age || null, phone || '', income || null, cibil || null, collateral || '', employment || '', scheme_id || null, id_proof, income_proof, address_proof, userId]
    );

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loan: newLoan.rows[0],
    });
  } catch (error) {
    console.error('applyForLoan error:', error.message);
    res.status(500).json({ error: 'Server error during loan application' });
  }
};

// @desc    Get logged in user's loans
// @route   GET /api/loans/my
// @access  Private (Customer)
const getMyLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await pool.query('SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    res.json(loans.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching your loans' });
  }
};

// @desc    Get all loans (for owner)
// @route   GET /api/loans
// @access  Private (Owner)
const getAllLoans = async (req, res) => {
  try {
    // We optionally join with users table to get applicant data
    const loans = await pool.query(`
      SELECT loans.*, users.name as applicant_name, users.email as applicant_email 
      FROM loans 
      JOIN users ON loans.user_id = users.id 
      ORDER BY loans.created_at DESC
    `);

    res.json(loans.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching all loans' });
  }
};

// @desc    Update loan status
// @route   PUT /api/loans/:id/status
// @access  Private (Owner)
const updateLoanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, bank, account, interest, duration, emi, rejection_reason } = req.body; 

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let query = 'UPDATE loans SET status = $1';
    let values = [status];
    let queryIndex = 2;

    if(status === 'approved') {
      query += `, approved_date = NOW()`;
      if(bank) { query += `, bank=$${queryIndex++}`; values.push(bank); }
      if(account) { query += `, account=$${queryIndex++}`; values.push(account); }
      if(interest !== undefined) { query += `, interest=$${queryIndex++}`; values.push(interest); }
      if(duration) { query += `, duration=$${queryIndex++}`; values.push(duration); }
      if(emi !== undefined) { query += `, emi=$${queryIndex++}`; values.push(emi); }
    }

    if(status === 'rejected' && rejection_reason) {
      query += `, rejection_reason=$${queryIndex++}`;
      values.push(rejection_reason);
    }

    query += ` WHERE id = $${queryIndex} RETURNING *`;
    values.push(id);

    const updatedLoan = await pool.query(query, values);

    if (updatedLoan.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json({
      message: 'Loan status updated',
      loan: updatedLoan.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error updating loan status' });
  }
};

module.exports = {
  applyForLoan,
  getMyLoans,
  getAllLoans,
  updateLoanStatus,
};
