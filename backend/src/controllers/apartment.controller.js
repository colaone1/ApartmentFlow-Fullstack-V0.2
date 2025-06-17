const Apartment = require('../models/apartment.model');
const NodeCache = require('node-cache');

// Initialize cache with a standard TTL of 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

// Query builder for apartment filters
const buildApartmentQuery = (req) => {
  // Handle user role-based access
  if (req.user) {
    if (req.user.role === 'admin') {
      // Admin sees all listings
      return {};
    } else if (req.user.role === 'agent') {
      // Agent sees public listings and their own private listings
      return {
        $or: [{ isPublic: true }, { owner: req.user._id }],
      };
    } else {
      // Regular users see only public listings
      return { isPublic: true };
    }
  } else {
    // Unauthenticated users see only public listings
    return { isPublic: true };
  }
};

// @desc    Get all apartments
// @route   GET /api/apartments
// @access  Public
const getApartments = async (req, res) => {
  try {
    const query = buildApartmentQuery(req);

    // Execute query with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const apartments = await Apartment.find(query)
      .select(
        'title price location bedrooms bathrooms area amenities images owner status isPublic createdAt'
      )
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Apartment.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return res.json({
      apartments,
      page,
      pages,
      total,
    });
  } catch (error) {
    console.error('Error in getApartments:', error);
    return res.status(500).json({ message: 'Error fetching apartments', error: error.message });
  }
};

// @desc    Get single apartment
// @route   GET /api/apartments/:id
// @access  Public
const getApartment = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id).populate('owner', 'name email');

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Check if the apartment is public or if the user has access
    if (
      !apartment.isPublic &&
      (!req.user ||
        (apartment.owner._id.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin' &&
          req.user.role !== 'agent'))
    ) {
      return res.status(403).json({ error: 'Not authorized to view this apartment' });
    }

    return res.json(apartment);
  } catch (error) {
    return next(error);
  }
};

// @desc    Create apartment
// @route   POST /api/apartments
// @access  Private
const createApartment = async (req, res, next) => {
  try {
    // Only admin and agent can create listings
    if (req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({ error: 'Only admins and agents can create listings' });
    }

    const apartment = await Apartment.create({
      ...req.body,
      owner: req.user._id,
    });

    const populatedApartment = await Apartment.findById(apartment._id).populate(
      'owner',
      'name email'
    );
    return res.status(201).json(populatedApartment);
  } catch (error) {
    return next(error);
  }
};

// @desc    Update apartment
// @route   PUT /api/apartments/:id
// @access  Private
const updateApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Check ownership or admin status
    if (apartment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this apartment' });
    }

    // Check for isPublic status change
    if (req.body.isPublic !== undefined && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Only admins can change the public status of listings' });
    }

    // Update apartment
    const updatedApartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!updatedApartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    return res.json(updatedApartment);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    // Handle other errors
    console.error('Error in updateApartment:', error);
    return res.status(500).json({ error: 'Error updating apartment', details: error.message });
  }
};

// @desc    Delete apartment
// @route   DELETE /api/apartments/:id
// @access  Private
const deleteApartment = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Check ownership and role
    if (apartment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this apartment' });
    }

    await apartment.deleteOne();

    return res.json({ message: 'Apartment removed' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getApartments,
  getApartment,
  createApartment,
  updateApartment,
  deleteApartment,
};
