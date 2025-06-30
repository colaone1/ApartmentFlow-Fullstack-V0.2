const mongoose = require('mongoose');

// MongoDB connection optimization
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool optimization
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity

      // Write concern optimization
      writeConcern: {
        w: 'majority',
        j: true, // Journal acknowledgment
        wtimeout: 5000, // 5 second timeout
      },

      // Read preference optimization
      readPreference: 'primaryPreferred',

      // Server selection timeout
      serverSelectionTimeoutMS: 5000,

      // Socket timeout
      socketTimeoutMS: 45000,

      // Buffer commands optimization
      bufferCommands: false,

      // Auto index creation (disable in production for performance)
      autoIndex: process.env.NODE_ENV === 'development',

      // Compress data
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
    });

    return conn;
  } catch (error) {
    process.exit(1);
  }
};

// Query optimization middleware
const optimizeQueries = () => {
  // Add query optimization hooks
  mongoose.plugin((schema) => {
    schema.pre('find', function () {
      // Add lean() for read-only queries to improve performance
      if (!this._mongooseOptions.lean) {
        this.lean();
      }
    });

    schema.pre('findOne', function () {
      if (!this._mongooseOptions.lean) {
        this.lean();
      }
    });
  });
};

// Connection event handlers for better monitoring
const setupConnectionHandlers = () => {
  mongoose.connection.on('connected', () => {});

  mongoose.connection.on('error', (err) => {});

  mongoose.connection.on('disconnected', () => {});

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

module.exports = {
  connectDB,
  optimizeQueries,
  setupConnectionHandlers,
};
