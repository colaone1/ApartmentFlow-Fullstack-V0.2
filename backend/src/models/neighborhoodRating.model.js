const mongoose = require('mongoose');

const neighborhoodRatingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
      index: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

neighborhoodRatingSchema.index({ user: 1, apartment: 1 }, { unique: true });

const NeighborhoodRating = mongoose.model('NeighborhoodRating', neighborhoodRatingSchema);
module.exports = NeighborhoodRating;
