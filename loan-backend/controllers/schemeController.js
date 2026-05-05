const pool = require('../config/db');

// Get all active loan schemes
const getAllSchemes = async (req, res) => {
  try {
    const schemes = await pool.query(
      'SELECT * FROM loan_schemes WHERE is_active = true ORDER BY id'
    );
    res.json(schemes.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching schemes' });
  }
};

// Get single scheme
const getScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const scheme = await pool.query('SELECT * FROM loan_schemes WHERE id = $1', [id]);
    
    if (scheme.rows.length === 0) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    
    res.json(scheme.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching scheme' });
  }
};

// Create new scheme (Owner only)
const createScheme = async (req, res) => {
  try {
    const { name, interest_rate, max_amount, min_amount, duration, description } = req.body;

    if (!name || !interest_rate || !max_amount || !duration) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const newScheme = await pool.query(
      `INSERT INTO loan_schemes (name, interest_rate, max_amount, min_amount, duration, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, interest_rate, max_amount, min_amount || 10000, duration, description]
    );

    res.status(201).json({
      message: 'Scheme created successfully',
      scheme: newScheme.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error creating scheme' });
  }
};

// Update scheme (Owner only)
const updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, interest_rate, max_amount, min_amount, duration, description, is_active } = req.body;

    const updatedScheme = await pool.query(
      `UPDATE loan_schemes 
       SET name = COALESCE($1, name),
           interest_rate = COALESCE($2, interest_rate),
           max_amount = COALESCE($3, max_amount),
           min_amount = COALESCE($4, min_amount),
           duration = COALESCE($5, duration),
           description = COALESCE($6, description),
           is_active = COALESCE($7, is_active)
       WHERE id = $8 RETURNING *`,
      [name, interest_rate, max_amount, min_amount, duration, description, is_active, id]
    );

    if (updatedScheme.rows.length === 0) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    res.json({
      message: 'Scheme updated successfully',
      scheme: updatedScheme.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error updating scheme' });
  }
};

// Delete scheme (Owner only)
const deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete - just mark as inactive
    const result = await pool.query(
      'UPDATE loan_schemes SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error deleting scheme' });
  }
};

module.exports = {
  getAllSchemes,
  getScheme,
  createScheme,
  updateScheme,
  deleteScheme
};
