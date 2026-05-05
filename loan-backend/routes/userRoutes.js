const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Owners only' });
  }
};

// Owner Route
router.get('/', protect, ownerOnly, getAllUsers);

module.exports = router;
