# Testing Troubleshooting Guide

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Database Testing Issues](#database-testing-issues)
3. [Authentication Issues in Tests](#authentication-issues-in-tests)
4. [Schema Validation Errors](#schema-validation-errors)
5. [Test Data Isolation](#test-data-isolation)
6. [Mock and Stub Issues](#mock-and-stub-issues)
7. [Jest Configuration Issues](#jest-configuration-issues)
8. [Notes Backend Specific Issues](#notes-backend-specific-issues)
9. [Performance Testing Issues](#performance-testing-issues)
10. [Integration Testing Issues](#integration-testing-issues)
11. [Frontend Import Resolution Issues](#frontend-import-resolution-issues)
12. [ESLint Warning Management](#eslint-warning-management)
13. [Build Process Issues](#build-process-issues)
14. [Quick Reference](#quick-reference)
15. [Rate Limiting and Test Payload Validity](#rate-limiting-and-test-payload-validity)
16. [Modern ESLint & Lint-Staged Troubleshooting (2024)](#modern-eslint-&-lint-staged-troubleshooting-2024)
17. [Fullstack Troubleshooting Lessons (2025)](#fullstack-troubleshooting-lessons-2025)

---

## Test Environment Setup

### 1. Jest Configuration Issues

**Issue**: Jest not running properly or tests failing due to configuration
**Error**: Various Jest-related errors

**Fix**: Proper Jest configuration in `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 2. Test Setup Function Issues

**Issue**: Test helper functions not properly exported or imported
**Error**: `ReferenceError: setupTestDB is not a function`

**Fix**: Ensure proper test setup:

```javascript
// ✅ CORRECT: Use require instead of destructuring
require('./setup'); // This runs the setup hooks

// ❌ INCORRECT: Don't try to destructure non-existent exports
const { setupTestDB } = require('./setup'); // setupTestDB doesn't exist
```

**Prevention**:

- Check what's actually exported from setup files
- Use `require('./setup')` to run setup hooks
- Don't assume helper functions exist without checking

### 3. Environment Variable Issues

**Issue**: Tests failing due to missing environment variables
**Error**: `process.env.VARIABLE is undefined`

**Fix**: Set up test environment variables in `jest.setup.js`:

```javascript
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_apartment_search';
process.env.JWT_SECRET = 'test-secret';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';
```

### 4. Test Database Connection Issues

**Issue**: Tests can't connect to test database
**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Fix**: Proper test database setup with error handling:

```javascript
// jest.setup.js
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI, {
      maxPoolSize: 1, // Use smaller pool for tests
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Test database disconnection failed:', error);
  }
});
```

---

## Rate Limiting and Test Payload Validity

### 1. Bypassing Rate Limiting in Test Environments

**Issue**: Tests fail with HTTP 429 errors (Too Many Requests) when hitting authentication or other rate-limited endpoints repeatedly.

**Error**: `429 Too Many Requests` or `Too many authentication attempts, please try again later.`

**Fix**: Always bypass rate limiting middleware in test environments by checking `process.env.NODE_ENV === 'test'` before applying rate limiters in your app and middleware. This ensures tests are never blocked by rate limits, regardless of import order or environment setup.

```javascript
// Example: Only apply rate limiting in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/auth/', authLimiter);
  app.use(apiLimiter);
}
```

### 2. Valid Payloads for Authorization Tests

**Issue**: Tests for authorization (403 errors) send incomplete or invalid payloads, causing validation errors (400) before the authorization check is reached.

**Error**: `400 Validation Error` instead of expected `403 Forbidden`.

**Fix**: Always send a fully valid payload (all required fields) when testing authorization logic. This ensures the controller's authorization check is hit before validation, and the correct status code is returned.

```javascript
// ✅ CORRECT: Send valid payload for unauthorized update test
const validUpdate = {
  title: 'Hacked',
  content: 'Hacked content',
  category: 'general',
  priority: 'medium',
  apartmentId: otherApartment._id,
};
const response = await request(app)
  .put(`/api/notes/${otherNote._id}`)
  .set('Authorization', `Bearer ${authToken}`)
  .send(validUpdate);
expect(response.status).toBe(403);
```

---

## Database Testing Issues

### 1. Database Cleanup Issues

**Issue**: Tests affecting each other due to shared database state
**Error**: Inconsistent test results, data conflicts

**Fix**: Proper test isolation with comprehensive cleanup:

```javascript
// Clean up after each test
afterEach(async () => {
  try {
    // Clean up in order of dependencies
    await Note.deleteMany({});
    await Favorite.deleteMany({});
    await Apartment.deleteMany({});
    await User.deleteMany({});
    await Commute.deleteMany({});
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});
```

### 2. Slow Database Queries in Tests

**Issue**: Tests taking too long due to slow database operations
**Error**: Test timeouts

**Fix**: Optimize test database operations:

```javascript
// Use lean() for read-only operations
const apartments = await Apartment.find().lean();

// Use select() to limit fields
const apartments = await Apartment.find().select('title price location');

// Use bulk operations for multiple documents
const bulkOps = testData.map((data) => ({
  insertOne: { document: data },
}));
await Apartment.bulkWrite(bulkOps);
```

### 3. Test Data Factory Pattern

**Issue**: Inconsistent test data creation
**Error**: Tests failing due to missing or invalid data

**Fix**: Implement test data factories:

```javascript
// Test data factories
const createTestUser = (overrides = {}) => ({
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  ...overrides,
});

const createTestApartment = (userId, overrides = {}) => ({
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
  ...overrides,
});

// Usage in tests
const userData = createTestUser({ email: 'specific@example.com' });
const apartmentData = createTestApartment(userId, { price: 2000 });
```

---

## Authentication Issues in Tests

### 1. JWT Token Issues

**Issue**: Tests failing due to invalid JWT tokens
**Error**: 401 Unauthorized errors in tests

**Fix**: Use API endpoints for user creation and authentication in tests:

```javascript
// ✅ CORRECT: Register and login via API
const registerAndLoginUser = async (email = `test${Date.now()}@example.com`) => {
  try {
    // Register via API (ensures password hashing)
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email,
      password: 'password123',
    });

    // Login via API (ensures valid token)
    const loginResponse = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });

    return {
      userId: loginResponse.body._id,
      token: loginResponse.body.token,
      user: loginResponse.body,
    };
  } catch (error) {
    console.error('User registration/login failed:', error);
    throw error;
  }
};
```

**Prevention**:

- Always use API endpoints for user creation in tests
- Never create users directly in database (bypasses password hashing)
- Use the same authentication flow as production
- Add error handling for registration/login failures

### 2. Password Hashing Issues

**Issue**: Password comparison failures in tests
**Error**: Login failures despite correct credentials

**Fix**: Ensure consistent password hashing:

```javascript
// Use bcrypt consistently with proper error handling
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password comparison failed:', error);
    return false;
  }
};
```

### 3. Authentication Middleware Testing

**Issue**: Authentication middleware not working in tests
**Error**: Tests failing due to authentication issues

**Fix**: Test authentication middleware properly:

```javascript
// Test authentication middleware
describe('Authentication Middleware', () => {
  it('should allow authenticated requests', async () => {
    const { token } = await registerAndLoginUser();

    const response = await request(app)
      .get('/api/protected-route')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should reject unauthenticated requests', async () => {
    const response = await request(app).get('/api/protected-route');

    expect(response.status).toBe(401);
  });

  it('should reject invalid tokens', async () => {
    const response = await request(app)
      .get('/api/protected-route')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
```

---

## Schema Validation Errors

### 1. Missing Required Fields

**Issue**: Tests creating documents without all required fields
**Error**: Mongoose validation errors

**Fix**: Always provide all required fields, even in edge case tests:

```javascript
// ✅ CORRECT: Even validation tests need valid data
it('should validate required fields', async () => {
  // Create a valid apartment first
  const validApartment = await createTestApartment(testUser._id);

  const response = await request(app)
    .post('/api/notes')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ apartmentId: validApartment._id }); // Only omit note fields

  expect(response.status).toBe(400);
  expect(response.body.errors).toContain('Note title is required');
  expect(response.body.errors).toContain('Note content is required');
});
```

### 2. Data Type Mismatches

**Issue**: Tests sending wrong data types
**Error**: Cast errors or validation failures

**Fix**: Ensure correct data types with validation:

```javascript
// Data type validation helpers
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
};

// Use in tests
it('should validate data types', async () => {
  const invalidData = {
    price: 'not-a-number',
    email: 'invalid-email',
    apartmentId: 'invalid-id',
  };

  const response = await request(app)
    .post('/api/apartments')
    .set('Authorization', `Bearer ${authToken}`)
    .send(invalidData);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContain('Invalid price format');
  expect(response.body.errors).toContain('Invalid email format');
});
```

### 3. Enum Validation Errors

**Issue**: Values not matching enum constraints
**Error**: `ValidationError: Path 'status' is invalid`

**Fix**: Use valid enum values and test edge cases:

```javascript
// Test enum validation
describe('Enum Validation', () => {
  it('should accept valid enum values', async () => {
    const validStatuses = ['available', 'rented', 'maintenance'];

    for (const status of validStatuses) {
      const apartmentData = createTestApartment(testUser._id, { status });
      const apartment = new Apartment(apartmentData);
      await expect(apartment.save()).resolves.toBeDefined();
    }
  });

  it('should reject invalid enum values', async () => {
    const apartmentData = createTestApartment(testUser._id, {
      status: 'invalid-status',
    });
    const apartment = new Apartment(apartmentData);

    await expect(apartment.save()).rejects.toThrow();
  });
});
```

---

## Test Data Isolation

### 1. Shared Test Data Issues

**Issue**: Tests affecting each other due to shared data
**Error**: Inconsistent test results

**Fix**: Create fresh data for each test with proper isolation:

```javascript
// ✅ CORRECT: Each test creates its own data
describe('Notes API', () => {
  let testUser, authToken, testApartment;

  beforeEach(async () => {
    // Create fresh user and apartment for each test
    const { userId, token } = await registerAndLoginUser();
    testUser = { _id: userId };
    authToken = token;
    testApartment = await createTestApartment(userId);
  });

  afterEach(async () => {
    // Clean up is handled by the test setup
  });

  it('should create a note', async () => {
    const noteData = {
      apartmentId: testApartment._id,
      title: 'Test Note',
      content: 'Test content',
    };

    const response = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(noteData);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(noteData.title);
  });
});
```

### 2. Database State Pollution

**Issue**: Tests leaving data that affects other tests
**Error**: Test failures due to unexpected data

**Fix**: Proper cleanup between tests with error handling:

```javascript
// Clean up all collections after each test
afterEach(async () => {
  try {
    await Promise.all([
      Note.deleteMany({}),
      Favorite.deleteMany({}),
      Apartment.deleteMany({}),
      User.deleteMany({}),
      Commute.deleteMany({}),
    ]);
  } catch (error) {
    console.error('Test cleanup failed:', error);
    // Don't throw error to avoid masking test failures
  }
});
```

### 3. Test Data Dependencies

**Issue**: Tests depending on specific data state
**Error**: Brittle tests that fail when data changes

**Fix**: Use explicit test data setup:

```javascript
// Avoid depending on existing data
it('should not depend on existing data', async () => {
  // Create all required data explicitly
  const user = await User.create(createTestUser());
  const apartment = await Apartment.create(createTestApartment(user._id));

  // Test with explicit data
  const response = await request(app)
    .get(`/api/apartments/${apartment._id}`)
    .set('Authorization', `Bearer ${generateToken(user._id)}`);

  expect(response.status).toBe(200);
  expect(response.body._id).toBe(apartment._id.toString());
});
```

---

## Mock and Stub Issues

### 1. External Service Mocks

**Issue**: Tests failing due to external service dependencies
**Error**: Network errors or service unavailability

**Fix**: Proper mocking of external services:

```javascript
// Mock external services
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    secure_url: 'https://example.com/image.jpg',
    public_id: 'test-image-id',
  }),
  deleteImage: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../utils/googleMapsClient', () => ({
  geocode: jest.fn().mockResolvedValue({
    lat: 51.5074,
    lng: -0.1276,
    formatted_address: 'London, UK',
  }),
}));
```

### 2. Database Mock Issues

**Issue**: Database operations not being mocked properly
**Error**: Tests hitting real database

**Fix**: Mock database operations when needed:

```javascript
// Mock Mongoose operations
jest.mock('../models/user.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

// Mock specific operations
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
};

User.findOne.mockResolvedValue(mockUser);
User.create.mockResolvedValue(mockUser);
```

### 3. Time and Date Mocking

**Issue**: Tests failing due to time-dependent logic
**Error**: Inconsistent test results based on timing

**Fix**: Mock time and date functions:

```javascript
// Mock Date.now()
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

// Mock setTimeout and setInterval
jest.useFakeTimers();

// Advance timers in tests
jest.advanceTimersByTime(1000);

// Restore real timers
jest.useRealTimers();
```

---

## Jest Configuration Issues

### 1. Test Timeout Issues

**Issue**: Tests timing out
**Error**: `Timeout - Async callback was not invoked within the 5000ms timeout`

**Fix**: Increase timeout in Jest config and handle async operations:

```javascript
// jest.config.js
module.exports = {
  testTimeout: 10000, // 10 seconds
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// Handle async operations properly
it('should handle async operations', async () => {
  // Use proper async/await
  const result = await someAsyncOperation();
  expect(result).toBeDefined();
}, 15000); // Override timeout for specific test
```

### 2. Coverage Issues

**Issue**: Coverage not being generated properly
**Error**: Missing coverage reports

**Fix**: Proper coverage configuration:

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/jest.setup.js'],
};
```

### 3. Module Resolution Issues

**Issue**: Tests can't resolve modules
**Error**: `Cannot resolve module`

**Fix**: Configure module resolution:

```javascript
// jest.config.js
module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
};
```

---

## Notes Backend Specific Issues

### 1. Persistent Schema Validation Errors in Tests

**Issue**: Tests failing with `ValidationError: Apartment validation failed: owner: Path 'owner' is required`
**Error**: Occurs when creating notes that reference apartments without proper ownership

**Root Cause**:

- Tests creating apartments directly without the required `owner` field
- Database cleanup between tests affecting apartment references
- Tests relying on shared apartment objects that may be cleaned up

**Fix**: Always create apartments with proper ownership in tests:

```javascript
// ✅ CORRECT: Create apartment with owner
const createTestApartment = async (userId) => {
  return await Apartment.create({
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
    owner: userId, // ✅ ALWAYS include owner
    isPublic: true,
  });
};

// ✅ CORRECT: Use in tests
beforeEach(async () => {
  const apartment = await createTestApartment(testUser._id);
  await Note.create({
    user: testUser._id,
    apartment: apartment._id, // Use the created apartment's ID
    title: 'Test Note',
    content: 'Test content',
  });
});
```

**Prevention**:

- Never create apartments without the `owner` field, even in validation tests
- Always use helper functions that ensure all required fields are provided
- Create fresh apartments for each test rather than relying on shared objects

### 2. Test Data Isolation Issues

**Issue**: Tests affecting each other due to shared database state
**Error**: Inconsistent test results, data conflicts

**Fix**: Ensure proper test isolation:

```javascript
// ✅ CORRECT: Each test creates its own data
describe('Notes API', () => {
  beforeEach(async () => {
    // Create fresh user and apartment for each test
    const { userId, token } = await registerAndLoginUser();
    testUser = { _id: userId };
    authToken = token;
    testApartment = await createTestApartment(userId);
  });

  afterEach(async () => {
    // Clean up is handled by the test setup
  });
});
```

### 3. Authentication Token Issues in Tests

**Issue**: Tests failing due to invalid JWT tokens
**Error**: 401 Unauthorized errors in tests

**Fix**: Use API endpoints for user creation and authentication in tests:

```javascript
// ✅ CORRECT: Register and login via API
const registerAndLoginUser = async (email = 'testuser@example.com') => {
  // Register via API (ensures password hashing)
  await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });

  // Login via API (ensures valid token)
  const loginResponse = await request(app).post('/api/auth/login').send({
    email,
    password: 'password123',
  });

  return {
    userId: loginResponse.body._id,
    token: loginResponse.body.token,
  };
};
```

**Prevention**:

- Always use API endpoints for user creation in tests
- Never create users directly in database (bypasses password hashing)
- Use the same authentication flow as production

### 4. Missing Required Fields in Test Data

**Issue**: Tests creating documents without all required fields
**Error**: Mongoose validation errors

**Fix**: Always provide all required fields, even in edge case tests:

```javascript
// ✅ CORRECT: Even validation tests need valid data
it('should validate required fields', async () => {
  // Create a valid apartment first
  const validApartment = await createTestApartment(testUser._id);

  const response = await request(app)
    .post('/api/notes')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ apartmentId: validApartment._id }); // Only omit note fields

  expect(response.status).toBe(400);
  expect(response.body.errors).toContain('Note title is required');
  expect(response.body.errors).toContain('Note content is required');
});
```

### 5. Test Setup Function Issues

**Issue**: Test helper functions not properly exported or imported
**Error**: `ReferenceError: setupTestDB is not a function`

**Fix**: Ensure proper test setup:

```javascript
// ✅ CORRECT: Use require instead of destructuring
require('./setup'); // This runs the setup hooks

// ❌ INCORRECT: Don't try to destructure non-existent exports
const { setupTestDB } = require('./setup'); // setupTestDB doesn't exist
```

**Prevention**:

- Check what's actually exported from setup files
- Use `require('./setup')` to run setup hooks
- Don't assume helper functions exist without checking

---

## Performance Testing Issues

### 1. Slow Test Execution

**Issue**: Test suite taking too long to run
**Error**: CI/CD timeouts, slow development feedback

**Fix**: Optimize test performance:

```javascript
// Use parallel test execution
// jest.config.js
module.exports = {
  maxWorkers: '50%', // Use 50% of available cores
  testMatch: ['**/__tests__/**/*.test.js'],
};

// Use test data factories for faster setup
const createBulkTestData = async (count = 10) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(createTestUser({ email: `user${i}@example.com` }));
  }
  return await User.insertMany(users);
};
```

### 2. Memory Leaks in Tests

**Issue**: Tests consuming too much memory
**Error**: Out of memory errors, slow performance

**Fix**: Prevent memory leaks:

```javascript
// Clean up after each test
afterEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear timers
  jest.clearAllTimers();

  // Clean up database
  await cleanupDatabase();
});

// Use weak references for large objects
const testData = new WeakMap();
```

---

## Integration Testing Issues

### 1. API Integration Test Issues

**Issue**: Integration tests failing due to API changes
**Error**: Tests not reflecting actual API behavior

**Fix**: Proper API integration testing:

```javascript
// Test complete API workflows
describe('Complete User Workflow', () => {
  it('should handle user registration to apartment creation', async () => {
    // 1. Register user
    const registerResponse = await request(app).post('/api/auth/register').send(createTestUser());

    expect(registerResponse.status).toBe(201);

    // 2. Login user
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: registerResponse.body.email,
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token;

    // 3. Create apartment
    const apartmentResponse = await request(app)
      .post('/api/apartments')
      .set('Authorization', `Bearer ${token}`)
      .send(createTestApartment(loginResponse.body._id));

    expect(apartmentResponse.status).toBe(201);

    // 4. Create note for apartment
    const noteResponse = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        apartmentId: apartmentResponse.body._id,
        title: 'Test Note',
        content: 'Test content',
      });

    expect(noteResponse.status).toBe(201);
  });
});
```

### 2. Database Integration Issues

**Issue**: Tests not properly testing database interactions
**Error**: Tests passing but production failing

**Fix**: Test actual database operations:

```javascript
// Test actual database operations
it('should persist data correctly', async () => {
  const userData = createTestUser();
  const user = await User.create(userData);

  // Verify data was actually saved
  const savedUser = await User.findById(user._id);
  expect(savedUser).toBeDefined();
  expect(savedUser.email).toBe(userData.email);

  // Test relationships
  const apartment = await Apartment.create(createTestApartment(user._id));
  expect(apartment.owner.toString()).toBe(user._id.toString());
});
```

---

## Frontend Import Resolution Issues

### 1. Module Resolution Errors in Next.js

**Issue**: Next.js build fails with "Module not found" errors for ApiClient and other utilities
**Error**: `Module not found: Can't resolve '../../utils/apiClient'`

**Root Cause**: Relative import paths not resolving correctly in Next.js build process

**Fix**: Use absolute imports with `@/` prefix configured in `jsconfig.json`:

```javascript
// ❌ INCORRECT: Relative imports that may fail
import { ApiClient } from '../../utils/apiClient';
import performanceMonitor from '../utils/performance';

// ✅ CORRECT: Absolute imports with @/ prefix
import { ApiClient } from '@/utils/apiClient';
import performanceMonitor from '@/utils/performance';
```

**Configuration**: Ensure `jsconfig.json` is properly configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. Jest Module Resolution in Frontend Tests

**Issue**: Jest tests fail to resolve modules when using relative imports
**Error**: `Cannot resolve module '../../utils/apiClient'`

**Fix**: Update Jest configuration to handle absolute imports:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};
```

### 3. Import Path Consistency

**Issue**: Inconsistent import paths across components causing build failures
**Error**: Some files use relative paths, others use absolute paths

**Fix**: Standardize all imports to use absolute paths with `@/` prefix:

```bash
# Files that need updating:
# - src/app/auth/register/page.js
# - src/app/listings/[id]/page.js
# - src/app/profile/edit/page.js
# - src/app/listings/page.js
# - src/app/favorites/page.js
# - src/app/context/AuthContext.js
# - src/app/apartmentAdd/page.js
# - src/app/components/ErrorBoundary.js
```

**Prevention**:

- Always use `@/` prefix for imports from src/ directory
- Configure ESLint to enforce consistent import patterns
- Use IDE extensions to automatically fix import paths

---

## ESLint Warning Management

### 1. High ESLint Warning Count

**Issue**: 186 ESLint warnings affecting code quality and build process
**Error**: Warnings about unused variables, console statements, and undefined variables

**Categories of Warnings**:

- **no-unused-vars**: Unused imports and variables
- **no-console**: Console statements in production code
- **no-undef**: Undefined variables (especially in test files)

**Fix Strategy**:

```javascript
// 1. Remove unused imports
// ❌ INCORRECT
import React, { useState, useEffect } from 'react'; // useEffect not used

// ✅ CORRECT
import React, { useState } from 'react';

// 2. Handle console statements
// ❌ INCORRECT
console.log('Debug info');

// ✅ CORRECT
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

// 3. Fix undefined variables in tests
// ❌ INCORRECT
const { setupTestDB } = require('./setup'); // setupTestDB doesn't exist

// ✅ CORRECT
require('./setup'); // Just run the setup
```

### 2. ESLint Configuration for Development

**Issue**: ESLint rules too strict for development workflow
**Error**: Too many warnings blocking development

**Fix**: Configure ESLint with appropriate rules for development:

```javascript
// eslint.config.js
module.exports = {
  rules: {
    // Allow console statements in development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // Allow unused variables in test files
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // Allow undefined variables in test files
    'no-undef': ['error', { typeof: true }],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', '**/*.test.js'],
      rules: {
        'no-console': 'off',
        'no-unused-vars': 'warn',
      },
    },
  ],
};
```

### 3. Automated ESLint Fixes

**Issue**: Manual fixing of 186 warnings is time-consuming
**Error**: Build process slowed down by warning count

**Fix**: Use automated tools to fix common issues:

```bash
# Fix automatically fixable issues
npx eslint --fix src/

# Fix specific rule violations
npx eslint --fix --rule 'no-unused-vars: error' src/

# Generate report of remaining issues
npx eslint --format=compact src/ > eslint-report.txt
```

**Target**: Reduce warnings from 186 to <50 for production readiness

---

## Build Process Issues

### 1. Next.js Build Failures

**Issue**: Build process fails due to module resolution errors
**Error**: `Failed to compile` with module not found errors

**Root Cause**: Import path issues and ESLint configuration problems

**Fix**: Comprehensive build process setup:

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    // Don't fail build on ESLint warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

### 2. Husky Pre-push Hook Failures

**Issue**: Git push blocked by failing tests or build process
**Error**: `husky - pre-push script failed (code 1)`

**Fix**: Ensure all pre-push checks pass:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test && npm run build"
    }
  },
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix", "git add"]
  }
}
```

### 3. Environment-Specific Build Issues

**Issue**: Build works locally but fails in CI/CD
**Error**: Different behavior between local and remote environments

**Fix**: Consistent environment setup:

```bash
# Ensure consistent Node.js version
# .nvmrc
18.17.0

# Ensure consistent package versions
npm ci --only=production

# Run build with proper environment
NODE_ENV=production npm run build
```

---

## Quick Reference

### Common Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- note.test.js

# Run tests in watch mode
npm test -- --watch

# Clear test cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Run tests in parallel
npm test -- --maxWorkers=4

# Run tests matching pattern
npm test -- --testNamePattern="should create"
```

### Common Error Messages

- `ValidationError: owner: Path 'owner' is required`: Missing required field in test data
- `TypeError: asyncHandler is not a function`: Missing utility function
- `ReferenceError: setupTestDB is not a function`: Incorrect test setup import
- `401 Unauthorized`: Authentication token issues in tests
- `Timeout - Async callback was not invoked`: Test timeout - increase timeout
- `MongoNetworkError`: Database connection issue
- `Cannot resolve module`: Module resolution issue
- `Jest did not exit`: Memory leak or hanging async operations

### Emergency Procedures

1. **Tests Failing**

   - Check test database connection
   - Verify test environment variables
   - Review test data setup
   - Check for test isolation problems
   - Clear test cache

2. **Authentication Issues in Tests**

   - Use API endpoints for user creation
   - Ensure proper token generation
   - Check JWT secret configuration
   - Verify authentication middleware

3. **Database Issues in Tests**

   - Check test database connection
   - Verify database cleanup
   - Check for data isolation problems
   - Review schema validation

4. **Performance Issues**
   - Run tests in parallel
   - Use test data factories
   - Optimize database operations
   - Clear test cache

### Test Best Practices

1. **Always use descriptive test names** that explain what is being tested
2. **Follow the AAA pattern**: Arrange, Act, Assert
3. **Test one thing at a time** - each test should have a single responsibility
4. **Use test data factories** for consistent, reusable test data
5. **Clean up after each test** to ensure test isolation
6. **Mock external dependencies** to avoid network calls and external service issues
7. **Test both success and failure cases** for comprehensive coverage
8. **Use proper assertions** with meaningful error messages
9. **Keep tests fast** by optimizing database operations and using mocks
10. **Document complex test scenarios** with comments explaining the test setup

---

## Modern ESLint & Lint-Staged Troubleshooting (2024)

### Issue: Pre-commit hook fails with 'Invalid option --ignore-path' or '.eslintignore is no longer supported'

**Symptoms:**

- Commit is blocked by Husky/lint-staged with errors about deprecated ESLint flags or .eslintignore.
- Error: `Invalid option '--ignore-path' - perhaps you meant '--ignore-pattern'?`
- Error: `The ".eslintignore" file is no longer supported. Switch to using the "ignores" property in "eslint.config.js".`

**Fix:**

1. Move ignore patterns from `.eslintignore` to the `ignores` property in `eslint.config.js`.
2. Remove any `--ignore-path` or `.eslintignore` references from all lint-staged configs (check both frontend and backend `package.json`).
3. Use only `eslint --fix` and `prettier --write` in lint-staged for JS/TS files.

**Example lint-staged config:**

```json
"lint-staged": {
  "src/**/*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,jsx,ts,tsx,json,css,md}": [
    "prettier --write"
  ]
}
```

**Why:**

- Modern ESLint (v9+) and Next.js no longer support `.eslintignore` or the `--ignore-path` flag.
- All ignores must be in `eslint.config.js`.
- Lint-staged must not use deprecated flags or it will block commits.

**Tip:**

- If you have both frontend and backend, check both for old lint-staged configs!

---

_Last Updated: December 2024_
_Part of the Apartment Search Project Troubleshooting Suite_

---

## Upcoming Features & Testing Focus (Next Session)

- **Private Listings Visibility:** Implement a toggle/filter or 'My Listings' page for users to view their private listings. Ensure backend API supports this.
- **Commute Feature:** Add commute calculation (distance/time from listing to entered address) on apartment details pages.
- **Notes Feature:** Retest and polish notes functionality (add, edit, delete, filter) and fix any issues found.

# Fullstack Troubleshooting Lessons (2025)

## Common Bugs and Fixes from Real-World Debugging

### 1. Port Conflicts (`EADDRINUSE`)

- **Symptom:** Backend or frontend fails to start with `Error: listen EADDRINUSE: address already in use`.
- **Fix:** Kill all Node.js servers with:
  ```sh
  taskkill /F /IM node.exe
  ```
  Or find and kill the specific PID using `netstat -ano | findstr :5000` and `taskkill /PID <PID> /F`.

### 2. MongoDB URI and .env Issues

- **Symptom:** Backend crashes with `MongooseError: The uri parameter to openUri() must be a string, got "undefined"`.
- **Fix:**
  - Ensure `.env` is in the correct directory (usually `backend/`).
  - Variable must be named `MONGODB_URI` (no spaces).
  - Use `require('dotenv').config();` at the top of your entry file.
  - Print the value with `console.log('MONGODB_URI:', process.env.MONGODB_URI);` to verify loading.

### 3. Backend Crash Diagnosis

- **Symptom:** Backend starts, then crashes (sometimes with high memory usage logs).
- **Fix:**
  - Check for unbounded queries (use `.limit()` and pagination).
  - Check for port conflicts (see above).
  - Print environment variables to verify config.
  - Check logs for stack traces.

### 4. Frontend 500/404 Errors

- **Symptom:** Frontend shows blank page, 500, or 404 errors.
- **Fix:**
  - Check backend is running and accessible.
  - Check browser console and network tab for failed requests.
  - Ensure you are using the correct port (Next.js may auto-increment ports if 3000 is busy).

### 5. General Debugging Workflow

- Always check both backend and frontend logs.
- Use `console.log` to verify environment and config.
- Restart servers after any config or .env change.
- Use process managers or kill commands to avoid zombie processes.

## Commute Calculation Issues and Solutions

### Problem

- **OpenRouteService (ORS) API** was unreliable for short/local routes, often returning "No route found between origin and destination" even for valid addresses.
- **Google Maps Directions API** required a credit card for API key access, which was not desirable for this project.
- **Mapbox Directions API** sometimes required a card for new accounts, depending on region/account type.

### Solution

- Switched backend commute calculation to use **HERE Routing API** (https://developer.here.com/), which offers a generous free tier and does not require a card for API key access.
- Updated backend code to use HERE for both geocoding and routing, ensuring reliable commute time/distance calculations for all valid addresses.
- Removed ORS API key and code from the project for clarity and security.

#### Implementation Summary

- Added HERE API key to `.env` as `HERE_API_KEY`.
- Updated `backend/src/controllers/commute.controller.js` to use HERE Geocoding and Routing APIs.
- Installed `axios` in the backend for HTTP requests.
- Verified with backend tests and real-world addresses.
