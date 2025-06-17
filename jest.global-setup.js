const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Configure MongoDB Memory Server
  const mongod = await MongoMemoryServer.create({
    instance: {
      storageEngine: 'wiredTiger',
      args: ['--quiet'],
      dbPath: path.join(__dirname, '.mongodb-memory-server'),
    },
    binary: {
      version: '4.4.18', // Use a stable version
      downloadDir: path.join(__dirname, '.mongodb-memory-server'),
      checkMD5: false, // Skip MD5 check for faster startup
    },
  });

  const uri = mongod.getUri();
  
  // Save the URI and options to a file for test usage
  const config = {
    uri,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 10000
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'jest-mongodb-config.json'),
    JSON.stringify(config, null, 2)
  );

  // Store the instance globally for teardown
  global.__MONGOD__ = mongod;
  process.env.MONGODB_URI = uri;
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRE = '1h';
};
