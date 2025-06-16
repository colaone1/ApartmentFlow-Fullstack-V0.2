const Apartment = require('../models/apartment.model');
const NodeCache = require('node-cache');

// Initialize cache with a standard TTL of 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

// @desc    Get all apartments
// @route   GET /api/apartments
// @access  Public
const getApartments = async (req, res, next) => {
  try {
    // Create a cache key based on the query parameters and user role
    const cacheKey = JSON.stringify({
      query: req.query,
      userRole: req.user ? req.user.role : 'anonymous'
    });

    // Check if the data is in the cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Build query
    let query = {};

    // Apply visibility rules based on user role
    if (req.user) {
      console.log('User role:', req.user.role);
      if (req.user.role === 'admin') {
        // Admin can see all listings
        query = {};
      } else if (req.user.role === 'agent') {
        // Agent can see public listings and their own private listings
        query.$or = [
          { isPublic: true },
          { owner: req.user._id }
        ];
      } else {
        // Regular users can only see public listings
        query = { isPublic: true };
      }
    } else {
      // Non-authenticated users can only see public listings
      query = { isPublic: true };
    }

    console.log('Final query:', JSON.stringify(query));

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Filter by bedrooms
    if (req.query.bedrooms) {
      query.bedrooms = Number(req.query.bedrooms);
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search by location if coordinates provided
    if (req.query.lat && req.query.lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(req.query.lng), Number(req.query.lat)],
          },
          $maxDistance: req.query.radius ? Number(req.query.radius) * 1000 : 10000, // Default 10km
        },
      };
    }

    // Execute query with pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const apartments = await Apartment.find(query)
      .select('title price location bedrooms bathrooms area amenities images status owner createdAt isPublic externalUrl')
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found apartments:', apartments.length);
    console.log('First apartment:', apartments[0] ? JSON.stringify(apartments[0]) : 'No apartments found');

    const total = await Apartment.countDocuments(query);

    const response = {
      apartments,
      page,
      pages: Math.ceil(total / limit),
      total,
    };

    // Store the response in the cache
    cache.set(cacheKey, response);

    res.json(response);
  } catch (error) {
    next(error);
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
    if (!apartment.isPublic && 
        (!req.user || 
         (apartment.owner._id.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin' && 
          req.user.role !== 'agent'))) {
      return res.status(403).json({ error: 'Not authorized to view this apartment' });
    }

    res.json(apartment);
  } catch (error) {
    next(error);
  }
};

// @desc    Create apartment
// @route   POST /api/apartments
// @access  Private
const createApartment = async (req, res, next) => {
  try {
    // Only admins and agents can create listings
    if (req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({ error: 'Only admins and agents can create listings' });
    }

    const apartment = await Apartment.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json(apartment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update apartment
// @route   PUT /api/apartments/:id
// @access  Private
const updateApartment = async (req, res, next) => {
  try {
    let apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Check ownership and role
    if (apartment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this apartment' });
    }

    // Only admins can change isPublic status
    if (req.body.isPublic !== undefined && req.user.role !== 'admin') {
      delete req.body.isPublic;
    }

    apartment = await Apartment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(apartment);
  } catch (error) {
    next(error);
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

    res.json({ message: 'Apartment removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApartments,
  getApartment,
  createApartment,
  updateApartment,
  deleteApartment,
};
