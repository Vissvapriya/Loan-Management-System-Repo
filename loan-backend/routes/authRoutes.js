const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// An example of a protected route using our middleware
router.get('/me', protect, (req, res) => {
  res.json({ message: 'You have access to protected auth data.', user: req.user });
});

module.exports = router;
