const express = require('express');
const router = express.Router();

// GET /api/favorites
router.get('/', function (req, res, next) {
  // TODO: Get user's favorites
  res.status(501).json({ error: 'Not implemented yet' });
});

// POST /api/favorites
router.post('/', function (req, res, next) {
  // TODO: Add apartment to favorites
  res.status(501).json({ error: 'Not implemented yet' });
});

// DELETE /api/favorites/:id
router.delete('/:id', function (req, res, next) {
  // TODO: Remove apartment from favorites
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
