const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Apartment, Note } = require('../models');
require('./setup');

// Helper function to register and login a user via the API
const registerAndLoginUser = async (email) => {
  if (!email) {
    email = `testuser+${Date.now()}+${Math.floor(Math.random() * 10000)}@example.com`;
  }
  // Register
  await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });
  // Login
  const loginResponse = await request(app).post('/api/auth/login').send({
    email,
    password: 'password123',
  });
  return {
    userId: loginResponse.body._id,
    token: loginResponse.body.token,
  };
};

// Helper function to create a test apartment
const createTestApartment = async (userId) => {
  const apartment = await Apartment.create({
    title: 'Test Apartment',
    description: 'A test apartment',
    price: 1000,
    location: {
      type: 'Point',
      coordinates: [-0.1276, 51.5074],
      address: {
        street: '123 Test Street',
        city: 'London',
        state: 'England',
        zipCode: 'SW1A 1AA',
        country: 'UK',
      },
    },
    bedrooms: 2,
    bathrooms: 1,
    area: 800,
    owner: userId,
    isPublic: true,
  });
  return apartment;
};

describe('Notes API (Simplified)', () => {
  let testUser, testApartment, authToken;

  beforeEach(async () => {
    const { userId, token } = await registerAndLoginUser();
    testUser = { _id: userId };
    authToken = token;
    testApartment = await createTestApartment(userId);
  });

  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const noteData = {
        apartmentId: testApartment._id,
        content: 'This apartment is in a perfect location near campus.',
      };
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(noteData.content);
      expect(response.body.data.user).toBe(testUser._id.toString());
      expect(response.body.data.apartment).toBe(testApartment._id.toString());
    });
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ apartmentId: testApartment._id });
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    it('should validate content length', async () => {
      const noteData = {
        apartmentId: testApartment._id,
        content: 'b'.repeat(2001), // Too long
      };
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/cannot be more than 2000 characters/);
    });
  });

  describe('GET /api/notes/apartment/:apartmentId', () => {
    beforeEach(async () => {
      await Note.create([
        {
          user: testUser._id,
          apartment: testApartment._id,
          content: 'Content 1',
        },
        {
          user: testUser._id,
          apartment: testApartment._id,
          content: 'Content 2',
        },
      ]);
    });
    it('should get all notes for an apartment', async () => {
      const response = await request(app)
        .get(`/api/notes/apartment/${testApartment._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toHaveProperty('content');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let noteId;
    beforeEach(async () => {
      const note = await Note.create({
        user: testUser._id,
        apartment: testApartment._id,
        content: 'Note to delete',
      });
      noteId = note._id;
    });
    it('should delete a note', async () => {
      const response = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/deleted successfully/);
    });
  });
});

// [TROUBLESHOOTING] See BACKEND_TROUBLESHOOTING.md for schema mismatch and test data setup issues.
