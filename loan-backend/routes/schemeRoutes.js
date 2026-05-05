const express = require('express');
const { getAllSchemes, getScheme, createScheme, updateScheme, deleteScheme } = require('../controllers/schemeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Owners only' });
  }
};

// Public route - anyone can view schemes
router.get('/', getAllSchemes);
router.get('/:id', getScheme);

// Owner only routes
router.post('/', protect, ownerOnly, createScheme);
router.put('/:id', protect, ownerOnly, updateScheme);
router.delete('/:id', protect, ownerOnly, deleteScheme);

module.exports = router;
