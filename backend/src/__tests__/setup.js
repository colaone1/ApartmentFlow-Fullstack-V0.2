const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  // Wait for the connection to be established
  await mongoose.connection.asPromise();

  // Verify connection
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection not ready');
  }
});

afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  // Close all connections
  await Promise.all([mongoose.disconnect(), mongoServer.stop()]);
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  process.exit(0);
});

describe('Database Setup', () => {
  it('should connect to the database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
