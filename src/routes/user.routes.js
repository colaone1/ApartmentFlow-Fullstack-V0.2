const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getMe, updateMe, deleteMe } = require('../controllers/user.controller');

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.delete('/me', protect, deleteMe);

module.exports = router; 