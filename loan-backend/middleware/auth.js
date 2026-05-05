const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret');

    // Verify user still exists in DB
    const { Pool } = require('pg');
    const pool = require('../config/db');
    const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User no longer exists, please login again' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = { protect };
