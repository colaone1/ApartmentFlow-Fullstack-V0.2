// Mock external services for testing

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test_public_id'
      })
    }
  }
}))

// Mock Google Maps API
jest.mock('../utils/googleMapsClient', () => ({
  searchAddress: jest.fn().mockResolvedValue([
    {
      address: '1600 Amphitheatre Parkway, Mountain View, CA',
      placeId: '12345',
      lat: '37.4220',
      lon: '-122.0841'
    }
  ]),
  getDirections: jest.fn().mockResolvedValue({
    duration: '30 mins',
    distance: '5.2 km',
    route: 'Mock route data'
  })
}))

// Mock AI content analysis
jest.mock('../middleware/contentModeration', () => ({
  analyzeImageWithAI: jest.fn().mockResolvedValue({
    isAppropriate: true,
    confidence: 0.95,
    categories: ['safe']
  }),
  contentModeration: jest.fn().mockImplementation((req, res, next) => {
    req.file = req.file || { path: 'mock/path' }
    next()
  })
}))

module.exports = {
  // Export mock functions for manual control in tests
  resetMocks: () => {
    jest.clearAllMocks()
  }
} 