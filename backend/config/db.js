const mongoose = require('mongoose');

/**
 * Global cache for MongoDB connection across serverless invocations.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables.');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch((err) => {
      console.error(`MongoDB connection error: ${err.message}`);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;
