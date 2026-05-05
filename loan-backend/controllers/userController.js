const pool = require('../config/db');

// @desc    Get all registered customers
// @route   GET /api/users
// @access  Private (Owner)
const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC"
    );
    res.json(users.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

module.exports = {
  getAllUsers,
};
