const express = require('express');
const { applyForLoan, getMyLoans, getAllLoans, updateLoanStatus } = require('../controllers/loanController');
const { protect } = require('../middleware/auth');
const upload = require('../config/upload');

const router = express.Router();

// Middleware to check if user is an owner
const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Owners only' });
  }
};

// Customer Routes
router.post('/', protect, upload.fields([
  { name: 'id_proof', maxCount: 1 },
  { name: 'income_proof', maxCount: 1 },
  { name: 'address_proof', maxCount: 1 }
]), applyForLoan);
router.get('/my', protect, getMyLoans);

// Owner Routes
router.get('/', protect, ownerOnly, getAllLoans);
router.put('/:id/status', protect, ownerOnly, updateLoanStatus);

module.exports = router;
