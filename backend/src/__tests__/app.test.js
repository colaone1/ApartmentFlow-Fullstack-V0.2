const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/user.model');
const Apartment = require('../models/apartment.model');
require('./setup'); // Ensure MongoDB connection is established

jest.setTimeout(30000);

let testUser;
let authToken;

beforeEach(async () => {
  // Clear users and apartments before each test
  await User.deleteMany({});
  await Apartment.deleteMany({});
  // Create a test user
  testUser = await User.create({
    email: 'testuser@example.com',
    password: 'password123',
    name: 'Test User',
  });
  // Generate auth token
  authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('App', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route').expect(404);

    expect(response.body).toEqual({
      error: "Sorry, can't find that",
    });
  }, 30000);

  it('should return 200 and a list of apartments for /api/apartments', async () => {
    // Create a test apartment
    await Apartment.create({
      title: 'Test Apartment',
      description: 'A nice place',
      price: 1000,
      location: {
        type: 'Point',
        coordinates: [12.34, 56.78],
        address: {
          country: 'Testland',
          state: 'Test State',
          city: 'Testville',
          street: '123 Main St',
          zipCode: '12345',
        },
      },
      bedrooms: 2,
      bathrooms: 1,
      area: 50,
      status: 'available',
      amenities: ['WiFi'],
      images: [],
      owner: testUser._id,
    });

    const response = await request(app)
      .get('/api/apartments')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('apartments');
    expect(Array.isArray(response.body.apartments)).toBe(true);
    expect(response.body.apartments.length).toBeGreaterThan(0);
  }, 30000);
});
