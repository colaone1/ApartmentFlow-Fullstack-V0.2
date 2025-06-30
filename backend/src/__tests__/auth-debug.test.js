const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
require('./setup');

describe('Auth Debug', () => {
  it('should register and login a user successfully', async () => {
    const email = `testuser+${Date.now()}@example.com`;

    // Register
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email,
      password: 'password123',
    });

    expect(registerResponse.status).toBe(201);

    // Login
    const loginResponse = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body._id).toBeDefined();
    expect(loginResponse.body.token).toBeDefined();
  });
});
