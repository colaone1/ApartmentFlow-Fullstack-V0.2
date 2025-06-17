const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Apartment = require('../models/apartment.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');

let mongoServer;
let adminToken;
let agentToken;
let userToken;
let adminUser;
let agentUser;
let regularUser;
let cache;

// Helper function to create test apartment data
const createTestApartment = (isPublic = true) => ({
  title: `${isPublic ? 'Public' : 'Private'} Apartment`,
  description: `A ${isPublic ? 'public' : 'private'} listing`,
  price: isPublic ? 1000 : 2000,
  location: {
    coordinates: [0, 0],
    address: {
      street: isPublic ? '123 Main St' : '456 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country',
    },
  },
  bedrooms: isPublic ? 2 : 3,
  bathrooms: isPublic ? 1 : 2,
  area: isPublic ? 1000 : 1500,
  isPublic,
  externalUrl: `https://example.com/${isPublic ? 'public' : 'private'}`,
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  cache = new NodeCache();

  // Create test users
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });

  agentUser = await User.create({
    name: 'Agent User',
    email: 'agent@test.com',
    password: 'password123',
    role: 'agent',
  });

  regularUser = await User.create({
    name: 'Regular User',
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
  });

  // Generate tokens
  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
  agentToken = jwt.sign({ id: agentUser._id }, process.env.JWT_SECRET);
  userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  // Clean up all test data
  await User.deleteMany({});
  await Apartment.deleteMany({});

  // Close cache
  if (cache) {
    cache.close();
    cache = null;
  }

  // Disconnect from MongoDB
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Stop MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
});

beforeEach(async () => {
  // Clear the cache before each test
  if (cache) {
    cache.flushAll();
  }
  // Clear apartments before each test
  await Apartment.deleteMany({});
});

describe('Apartment Access Control', () => {
  test('should create public and private listings', async () => {
    const publicListing = createTestApartment(true);
    const privateListing = createTestApartment(false);

    // Create listings as admin
    const [publicResponse, privateResponse] = await Promise.all([
      request(app)
        .post('/api/apartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(publicListing),
      request(app)
        .post('/api/apartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(privateListing),
    ]);

    expect(publicResponse.status).toBe(201);
    expect(privateResponse.status).toBe(201);
    expect(publicResponse.body.isPublic).toBe(true);
    expect(privateResponse.body.isPublic).toBe(false);
  });

  test('should only show public listings to regular users', async () => {
    const publicListing = createTestApartment(true);
    const privateListing = createTestApartment(false);

    // Create listings as admin
    await Promise.all([
      request(app)
        .post('/api/apartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(publicListing),
      request(app)
        .post('/api/apartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(privateListing),
    ]);

    // Regular user should only see public listing
    const response = await request(app)
      .get('/api/apartments')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.apartments).toHaveLength(1);
    expect(response.body.apartments[0].isPublic).toBe(true);
  });

  test('should show all listings to admin and their own private listings to agents', async () => {
    const publicListing = createTestApartment(true);
    const privateListing = createTestApartment(false);
    const agentPrivateListing = {
      ...createTestApartment(false),
      title: 'Agent Private Apartment',
      description: 'A private listing by agent',
      price: 3000,
    };

    // Create listings as admin
    await Promise.all([
      request(app)
        .post('/api/apartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(publicListing),
      request(app)
        .post('/api/apartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(privateListing),
    ]);

    // Create private listing as agent
    await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(agentPrivateListing);

    // Admin should see all listings
    const adminResponse = await request(app)
      .get('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.apartments).toHaveLength(3);

    // Agent should see public listings and their own private listing
    const agentResponse = await request(app)
      .get('/api/apartments')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(agentResponse.status).toBe(200);
    expect(agentResponse.body.apartments).toHaveLength(2);
    expect(
      agentResponse.body.apartments.some((apt) => apt.title === 'Agent Private Apartment')
    ).toBe(true);
  });

  test('should only allow admins to change isPublic status', async () => {
    // Create a listing as agent
    const listing = {
      title: 'Test Apartment',
      description: 'A test listing',
      price: 1000,
      location: {
        type: 'Point',
        coordinates: [0, 0],
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country',
        },
      },
      bedrooms: 2,
      bathrooms: 1,
      area: 1000,
      isPublic: true,
    };

    const createResponse = await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(listing);

    const apartmentId = createResponse.body._id;

    // Agent should not be able to change isPublic status
    const agentResponse = await request(app)
      .put(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        ...listing,
        isPublic: false,
      });

    expect(agentResponse.status).toBe(403);
    expect(agentResponse.body.error).toBe('Only admins can change the public status of listings');

    // Admin should be able to change isPublic status
    const adminResponse = await request(app)
      .put(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...listing,
        isPublic: false,
      });

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.isPublic).toBe(false);
  });
});
