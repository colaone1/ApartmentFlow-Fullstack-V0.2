const express = require('express');
const router = express.Router();
const commuteController = require('../controllers/commute.controller');

// GET /api/commute/suggestions
router.get('/suggestions', commuteController.getAddressSuggestions);

// POST /api/commute
router.post('/', commuteController.getCommuteTime);

// POST /api/commute/multiple
router.post('/multiple', commuteController.getMultipleCommuteTimes);

// GET /api/commute/place/:placeId
router.get('/place/:placeId', commuteController.getPlaceDetails);

// GET /api/commute/:apartmentId (keep this last to avoid catching other routes)
router.get('/:apartmentId', function (req, res, next) {
  // TODO: Get commute times for apartment
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
