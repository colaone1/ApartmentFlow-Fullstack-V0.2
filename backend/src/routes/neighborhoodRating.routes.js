const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const NeighborhoodRating = require('../models/neighborhoodRating.model');

// Add or update your rating for an apartment
router.post('/', protect, async (req, res) => {
  const { apartmentId, rating } = req.body;
  if (!apartmentId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'apartmentId and rating (1-5) required' });
  }
  const filter = { user: req.user.id, apartment: apartmentId };
  const update = { rating };
  const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
  const doc = await NeighborhoodRating.findOneAndUpdate(filter, update, opts);
  res.json({ success: true, data: doc });
});

// Get average and user rating for an apartment
router.get('/apartment/:apartmentId', protect, async (req, res) => {
  const { apartmentId } = req.params;
  const ratings = await NeighborhoodRating.find({ apartment: apartmentId });
  const avg = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : null;
  const userRating = ratings.find((r) => r.user.toString() === req.user.id)?.rating || null;
  res.json({
    success: true,
    average: avg,
    count: ratings.length,
    userRating,
  });
});

module.exports = router;
