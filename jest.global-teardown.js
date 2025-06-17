const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  try {
    // Try to stop all running MongoMemoryServer instances
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop({ force: true });
    }

    // Cleanup any remaining instances
    await MongoMemoryServer.cleanup();

    // Remove temporary files
    const configPath = path.join(__dirname, 'jest-mongodb-config.json');
    const dbPath = path.join(__dirname, '.mongodb-memory-server');

    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    if (fs.existsSync(dbPath)) {
      fs.rmSync(dbPath, { recursive: true, force: true });
    }

    // Clear any remaining environment variables
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRE;
  } catch (error) {
    console.error('Error during teardown:', error);
    // Force exit if cleanup fails
    process.exit(1);
  }
};
