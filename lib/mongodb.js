import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'creashort';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Construct the full connection string with database name
const getConnectionString = () => {
  if (MONGODB_URI.includes('mongodb+srv://')) {
    // For Atlas, append database name if not already included
    return MONGODB_URI.includes('/') ? MONGODB_URI : `${MONGODB_URI}/${MONGODB_DATABASE}`;
  } else {
    // For local MongoDB, append database name if not already included
    return MONGODB_URI.includes('/') ? MONGODB_URI : `${MONGODB_URI}/${MONGODB_DATABASE}`;
  }
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(getConnectionString(), opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
