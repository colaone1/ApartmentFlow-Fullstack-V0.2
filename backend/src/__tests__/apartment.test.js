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

// Initialize cache
const cache = new NodeCache();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create test users
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });

  agentUser = await User.create({
    name: 'Agent User',
    email: 'agent@test.com',
    password: 'password123',
    role: 'agent'
  });

  regularUser = await User.create({
    name: 'Regular User',
    email: 'user@test.com',
    password: 'password123',
    role: 'user'
  });

  // Generate tokens
  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
  agentToken = jwt.sign({ id: agentUser._id }, process.env.JWT_SECRET);
  userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the cache before each test
  cache.flushAll();
  // Clear apartments before each test
  await Apartment.deleteMany({});
});

describe('Apartment Access Control', () => {
  test('should create public and private listings', async () => {
    const publicListing = {
      title: 'Public Apartment',
      description: 'A public listing',
      price: 1000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 2,
      bathrooms: 1,
      area: 1000,
      isPublic: true,
      externalUrl: 'https://example.com/public'
    };

    const privateListing = {
      title: 'Private Apartment',
      description: 'A private listing',
      price: 2000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '456 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      isPublic: false,
      externalUrl: 'https://example.com/private'
    };

    // Create listings as admin
    const publicResponse = await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(publicListing);
    console.log('Public listing created:', publicResponse.body);

    const privateResponse = await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(privateListing);
    console.log('Private listing created:', privateResponse.body);

    expect(publicResponse.status).toBe(201);
    expect(privateResponse.status).toBe(201);
    expect(publicResponse.body.isPublic).toBe(true);
    expect(privateResponse.body.isPublic).toBe(false);
  });

  test('should only show public listings to regular users', async () => {
    // Create public and private listings as admin
    const publicListing = {
      title: 'Public Apartment',
      description: 'A public listing',
      price: 1000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 2,
      bathrooms: 1,
      area: 1000,
      isPublic: true
    };

    const privateListing = {
      title: 'Private Apartment',
      description: 'A private listing',
      price: 2000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '456 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      isPublic: false
    };

    await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(publicListing);

    await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(privateListing);

    // Regular user should only see public listing
    const response = await request(app)
      .get('/api/apartments')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.apartments).toHaveLength(1);
    expect(response.body.apartments[0].isPublic).toBe(true);
  });

  test('should show all listings to admin and their own private listings to agents', async () => {
    // Create listings as admin
    const publicListing = {
      title: 'Public Apartment',
      description: 'A public listing',
      price: 1000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 2,
      bathrooms: 1,
      area: 1000,
      isPublic: true
    };

    const privateListing = {
      title: 'Private Apartment',
      description: 'A private listing',
      price: 2000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '456 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      isPublic: false
    };

    const publicResponse = await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(publicListing);
    console.log('Public listing created:', publicResponse.body);

    const privateResponse = await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(privateListing);
    console.log('Private listing created:', privateResponse.body);

    // Create private listing as agent
    const agentPrivateListing = {
      title: 'Agent Private Apartment',
      description: 'A private listing by agent',
      price: 3000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '789 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 4,
      bathrooms: 3,
      area: 2000,
      isPublic: false
    };

    const agentCreateResponse = await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(agentPrivateListing);
    console.log('Agent listing created:', agentCreateResponse.body);

    // Verify all listings exist in database
    const allListings = await Apartment.find({});
    console.log('All listings in database:', allListings.map(l => ({ title: l.title, isPublic: l.isPublic })));

    // Admin should see all listings
    const adminResponse = await request(app)
      .get('/api/apartments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Accept', 'application/json');

    console.log('Admin response status:', adminResponse.status);
    console.log('Admin response body:', JSON.stringify(adminResponse.body, null, 2));
    console.log('Number of apartments found:', adminResponse.body.apartments.length);
    console.log('Apartment titles:', adminResponse.body.apartments.map(apt => apt.title));

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.apartments).toHaveLength(3);

    // Agent should see public listings and their own private listing
    const agentResponse = await request(app)
      .get('/api/apartments')
      .set('Authorization', `Bearer ${agentToken}`)
      .set('Accept', 'application/json');

    expect(agentResponse.status).toBe(200);
    expect(agentResponse.body.apartments).toHaveLength(2);
    expect(agentResponse.body.apartments.some(apt => apt.isPublic)).toBe(true);
    expect(agentResponse.body.apartments.some(apt => apt.owner._id.toString() === agentUser._id.toString())).toBe(true);
  });

  test('should only allow admins to change isPublic status', async () => {
    // Create a listing as agent
    const listing = {
      title: 'Test Apartment',
      description: 'A test listing',
      price: 1000,
      location: {
        coordinates: [0, 0],
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      bedrooms: 2,
      bathrooms: 1,
      area: 1000,
      isPublic: true
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
      .send({ isPublic: false });

    expect(agentResponse.status).toBe(403);
    expect(agentResponse.body.error).toBe('Only admins can change the public status of listings');

    // Admin should be able to change isPublic status
    const adminResponse = await request(app)
      .put(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isPublic: false });

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.isPublic).toBe(false);
  });
}); 